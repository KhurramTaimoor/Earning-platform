export const API_BASE =
  import.meta.env.VITE_API_URL || 'https://earning-platform-cykm.onrender.com/api';

function getSavedToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('bms_token') ||
    ''
  );
}

async function request(path, options = {}) {
  const token = getSavedToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.details ||
      `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  return data;
}

export const api = {
  get(path) {
    return request(path, {
      method: 'GET',
    });
  },

  post(path, body = {}) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(path, body = {}) {
    return request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(path, body = {}) {
    return request(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(path) {
    return request(path, {
      method: 'DELETE',
    });
  },

  postForm(path, formData) {
    return request(path, {
      method: 'POST',
      body: formData,
    });
  },
};

export function errorMessage(err) {
  return err?.message || 'Something went wrong';
}
