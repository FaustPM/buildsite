const BOT_URL = 'http://localhost:8081/submit';

function handleModalSubmit(e) {
  e.preventDefault();
  const t = translations[currentLang];
  const form = document.getElementById('modalForm');
  const fd = new FormData(form);
  const data = {
    form_type: 'Consulta de servicio',
    source:  modalSource || fd.get('service') || '',
    name:    fd.get('name')    || '',
    phone:   fd.get('phone')   || '',
    service: fd.get('service') || '',
    message: fd.get('message') || '',
  };
  fetch(BOT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {});
  form.style.display = 'none';
  const s = document.getElementById('modalSuccess');
  s.style.display = 'block';
  s.querySelector('p').innerHTML = t.form_sent;
  setTimeout(() => {
    document.getElementById('serviceModal').classList.remove('open');
    document.body.style.overflow = '';
  }, 2500);
}

function handleSubmit(e) {
  e.preventDefault();
  const t = translations[currentLang];
  const form = document.getElementById('reformForm');
  const fd = new FormData(form);
  const data = {
    form_type: 'Presupuesto',
    source:  fd.get('service') || '',
    name:    fd.get('name')    || '',
    phone:   fd.get('phone')   || '',
    email:   fd.get('email')   || '',
    service: fd.get('service') || '',
    message: fd.get('message') || '',
  };
  fetch(BOT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {});
  form.style.display = 'none';
  const s = document.getElementById('formSuccess');
  s.style.display = 'block';
  s.querySelector('p').innerHTML = t.form_sent;
}
