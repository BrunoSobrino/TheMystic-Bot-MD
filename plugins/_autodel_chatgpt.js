const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

async function deleteInactiveUserData(m) {
  const user = global.chatgpt.data.users[m.sender];
  if (!user) return; // Si no existe el usuario, no hace nada

  const lastUpdateTime = user.lastUpdate || 0;
  const currentTime = new Date().getTime();

  if (currentTime - lastUpdateTime > INACTIVITY_TIMEOUT_MS) {
    delete global.chatgpt.data.users[m.sender];
    // console.log(`Datos del usuario ${m.sender} eliminados después de ${INACTIVITY_TIMEOUT_MS / 1000 / 60} minutos de inactividad.`);
  }
}

export async function all(m) {
  const user = global.chatgpt.data.users[m.sender];

  if (user) {
    user.lastUpdate = new Date().getTime();
    global.chatgpt.data.users[m.sender] = user;
  } else {
    return; // Si no existe el usuario, no hace nada
  }

  setTimeout(() => deleteInactiveUserData(m), INACTIVITY_TIMEOUT_MS);
}

/* const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

async function deleteInactiveUserData(m) {
  const user = global.chatgpt.data.users[m.sender];
  const lastUpdateTime = user?.lastUpdate || 0;
  const currentTime = new Date().getTime();

  if (currentTime - lastUpdateTime > INACTIVITY_TIMEOUT_MS) {
    delete global.chatgpt.data.users[m.sender];
    //console.log(`Datos del usuario ${m.sender} eliminados después de ${INACTIVITY_TIMEOUT_MS / 1000 / 60} minutos de inactividad.`);
  }
}

export async function all(m) {
  let user = global.chatgpt.data.users[m.sender];

  if (user) {
    user.lastUpdate = new Date().getTime();
    global.chatgpt.data.users[m.sender] = user;
  }

  setTimeout(() => deleteInactiveUserData(m), INACTIVITY_TIMEOUT_MS);

}*/
