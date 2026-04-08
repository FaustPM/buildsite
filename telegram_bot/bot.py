"""
BuildSite — Telegram Bot (aiogram 3.x + aiohttp web server)

Получает заявки с сайта и пересылает в Telegram.

Запуск:
    python bot.py

Настройка:
    Скопируйте .env.example → .env и укажите BOT_TOKEN и CHAT_ID.
"""

import asyncio
import json
import logging
import os
from pathlib import Path

from aiohttp import web
from aiogram import Bot
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from dotenv import load_dotenv

# ── Конфигурация ──────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent / '.env')

BOT_TOKEN: str = os.getenv('BOT_TOKEN', '')
CHAT_ID:   str = os.getenv('CHAT_ID', '')
HOST:      str = os.getenv('HOST', '0.0.0.0')
PORT:      int = int(os.getenv('PORT', '8081'))

RECIPIENTS_FILE = Path(__file__).parent / 'recipients.txt'


def get_recipients() -> list[str]:
    """Читает ID получателей из файла recipients.txt без перезапуска бота.
    Каждый ID — на отдельной строке. Пустые строки и # комментарии игнорируются.
    Если файл не существует — возвращает CHAT_ID из .env."""
    if not RECIPIENTS_FILE.exists():
        return [CHAT_ID] if CHAT_ID else []
    ids = []
    for line in RECIPIENTS_FILE.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#'):
            ids.append(line)
    return ids if ids else ([CHAT_ID] if CHAT_ID else [])


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s  %(levelname)-8s  %(message)s',
    datefmt='%H:%M:%S',
)
log = logging.getLogger(__name__)

# ── Переводы ─────────────────────────────────────────────────────────────────
FORM_TYPE_RU = {
    'Presupuesto':        'Расчёт стоимости',
    'Consulta de servicio': 'Консультация',
    'Consulta':           'Консультация',
}

SERVICE_RU = {
    # Услуги — испанский
    'Reforma integral de viviendas':     'Полный ремонт жилья',
    'Reforma de locales comerciales':    'Ремонт коммерческих помещений',
    'Diseño y reforma de cocinas':       'Дизайн и ремонт кухонь',
    'Reforma de baños':                  'Ремонт ванных комнат',
    'Reforma de oficinas':               'Ремонт офисов',
    'Restauración de patios':            'Реставрация дворов',
    # Услуги — каталанский
    "Reforma integral d'habitatges":     'Полный ремонт жилья',
    'Reforma de locals comercials':      'Ремонт коммерческих помещений',
    'Disseny i reforma de cuines':       'Дизайн и ремонт кухонь',
    'Reforma de banys':                  'Ремонт ванных комнат',
    "Reforma d'oficines":                'Ремонт офисов',
    'Restauració de patis':              'Реставрация дворов',
    # Проекты галереи — каталанский (заголовки)
    'Reforma integral de pis':           'Полный ремонт квартиры',
    'Disseny de cuina':                  'Дизайн кухни',
    'Reforma de bany':                   'Ремонт ванной',
    'Local comercial':                   'Коммерческое помещение',
    'Restauració de façana':             'Реставрация фасада',
    "Reforma d'oficina":                 'Ремонт офиса',
    'Pis modernitzat':                   'Обновлённая квартира',
    'Reforma completa':                  'Полный ремонт',
    # Категории галереи — каталанский
    'Habitatge · Barcelona':             'Жильё · Барселона',
    'Cuina · Eixample':                  'Кухня · Эйшампле',
    'Bany · Gràcia':                     'Ванная · Грасиа',
    'Comercial · Sarrià':                'Коммерческое · Сарриа',
    'Façana · Poblenou':                 'Фасад · Побленоу',
    'Oficina · Les Corts':               'Офис · Лес Кортс',
    'Habitatge · Sant Gervasi':          'Жильё · Сант Жерваси',
    'Habitatge · Horta':                 'Жильё · Орта',
}


def translate_source(source: str) -> str:
    """Переводит source на русский. Поддерживает формат 'Заголовок — Категория'."""
    if not source:
        return source
    # Прямой перевод
    if source in SERVICE_RU:
        return SERVICE_RU[source]
    # Разбиваем составную строку «Заголовок — Категория»
    if ' — ' in source:
        parts = source.split(' — ', 1)
        title = SERVICE_RU.get(parts[0].strip(), parts[0].strip())
        cat   = SERVICE_RU.get(parts[1].strip(), parts[1].strip())
        return f'{title} — {cat}'
    return source

# ── Иконки типов форм ────────────────────────────────────────────────────────
FORM_ICONS = {
    'Расчёт стоимости': '💰',
    'Консультация':     '📬',
}

def get_icon(form_type: str) -> str:
    return FORM_ICONS.get(form_type, '📋')


def build_message(data: dict) -> str:
    """Форматируем данные формы в Telegram-сообщение."""
    raw_source = (data.get('source') or '').strip()
    raw_type   = data.get('form_type', '')

    # Заголовок: источник (услуга/проект) если есть, иначе тип формы
    if raw_source:
        title = translate_source(raw_source)
    else:
        title = FORM_TYPE_RU.get(raw_type, raw_type) or 'Заявка'

    form_type = FORM_TYPE_RU.get(raw_type, raw_type) or 'Заявка'
    icon = get_icon(form_type)

    lines = [f'{icon} <b>{title}</b>\n']

    name    = (data.get('name')    or '').strip()
    phone   = (data.get('phone')   or '').strip()
    email   = (data.get('email')   or '').strip()
    service = (data.get('service') or '').strip()
    message = (data.get('message') or '').strip()

    if name:    lines.append(f'👤 <b>Имя:</b> {name}')
    if phone:   lines.append(f'📞 <b>Телефон:</b> {phone}')
    if email:   lines.append(f'📧 <b>Email:</b> {email}')
    service = SERVICE_RU.get(service, service)
    if service: lines.append(f'🔧 <b>Тип услуги:</b> {service}')
    if message: lines.append(f'💬 <b>Сообщение:</b> {message}')

    return '\n'.join(lines)


# ── HTTP-обработчик ───────────────────────────────────────────────────────────
async def handle_submit(request: web.Request) -> web.Response:
    # CORS preflight
    if request.method == 'OPTIONS':
        return web.Response(
            headers={
                'Access-Control-Allow-Origin':  '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        )

    try:
        data = await request.json()
    except Exception:
        raw = await request.read()
        try:
            data = json.loads(raw)
        except Exception:
            data = {}

    log.info('Получена заявка: %s', data)

    bot: Bot = request.app['bot']
    text = build_message(data)

    recipients = get_recipients()
    if not recipients:
        log.error('Нет получателей — добавьте ID в recipients.txt или CHAT_ID в .env')
        return web.json_response(
            {'status': 'error', 'detail': 'no recipients configured'},
            status=500,
            headers={'Access-Control-Allow-Origin': '*'},
        )

    first_failed = False
    for chat_id in recipients:
        try:
            await bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.HTML)
            log.info('Сообщение отправлено в Telegram (chat_id=%s)', chat_id)
        except Exception as exc:
            log.error('Ошибка отправки в Telegram (chat_id=%s): %s', chat_id, exc)
            if chat_id == recipients[0]:
                first_failed = True

    if first_failed:
        return web.json_response(
            {'status': 'error', 'detail': 'failed to send to primary recipient'},
            status=500,
            headers={'Access-Control-Allow-Origin': '*'},
        )

    return web.json_response(
        {'status': 'ok'},
        headers={'Access-Control-Allow-Origin': '*'},
    )


# ── Приложение ────────────────────────────────────────────────────────────────
async def build_app(bot: Bot) -> web.Application:
    app = web.Application()
    app['bot'] = bot
    app.router.add_route('OPTIONS', '/submit', handle_submit)
    app.router.add_post('/submit', handle_submit)
    return app


async def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError('BOT_TOKEN не задан — скопируйте .env.example → .env')

    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )

    app = await build_app(bot)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, HOST, PORT)
    await site.start()

    log.info('HTTP-сервер запущен: http://%s:%d/submit', HOST, PORT)
    log.info('Бот запущен, ожидаю заявки...')

    try:
        await asyncio.Event().wait()
    finally:
        await bot.session.close()
        await runner.cleanup()


if __name__ == '__main__':
    asyncio.run(main())
