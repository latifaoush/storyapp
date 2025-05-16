// src\scripts\utils\auth.js
import { getActiveRoute } from '../routes/url-parser';
import { ACCESS_TOKEN_KEY } from '../config';

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('getLogout: error:', error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/';
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();

  if (!isLogin) {
    location.hash = '/login';
    return null;
  }

  return page;
}

export function improvedCheckAuthenticatedRoute(page) {
  const isLoggedIn = !!getAccessToken();
  
  if (!isLoggedIn) {
    // Handle redirect in a way that doesn't return null
    setTimeout(() => {
      window.location.hash = '/login';
    }, 0);
    
    // Return a minimal page with no content that can safely render
    return {
      render: () => '<div class="redirecting">Redirecting to login...</div>',
      afterRender: () => {}
    };
  }
  
  return page;
}

export function improvedCheckUnauthenticatedRouteOnly(page) {
  const isLoggedIn = !!getAccessToken();
  
  if (isLoggedIn) {
    // Handle redirect in a way that doesn't return null
    setTimeout(() => {
      window.location.hash = '/';
    }, 0);
    
    // Return a minimal page with no content that can safely render
    return {
      render: () => '<div class="redirecting">Redirecting to home...</div>',
      afterRender: () => {}
    };
  }
  
  return page;
}

export function getLogout() {
  localStorage.removeItem('accessToken');
}
