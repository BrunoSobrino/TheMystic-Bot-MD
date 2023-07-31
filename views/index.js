window.onload = () => {
  const chat = document.querySelector('div.container-fluid');
  function addMsg(obj) {
    const html = document.createElement('span');
    html.className = 'msg';
    html.innerHTML = obj;
    chat.appendChild(html);
  }

  window.onclick = () => addMsg(12);
};
