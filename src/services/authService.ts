import axios from 'axios';

export interface Auth {
  username: string;
  password: string;
}

const API_URL = 'https://atos-capital-backend-docker.onrender.com/api/auth/token/';

export async function login(credentials: Auth): Promise<void> {
  try {
    const response = await axios.post(API_URL, credentials, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const accessToken = response.data.access;

    if (!accessToken) {
      throw new Error('Token de acesso não retornado pela API.');
    }
    localStorage.setItem('token', accessToken);
  } catch (error: any) {
    console.error('Erro no login:', error.response?.data || error.message);
    throw new Error('Falha ao fazer login: ' + (error.response?.data?.detail || error.message));
  }
}

// const authService = {
//   login,
//   logout,
//   getToken
// };

// export default authService;
