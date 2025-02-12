'use client';

export function isPC() {
  return (
    window.matchMedia('(hover: hover)').matches && 
    window.matchMedia('(pointer: fine)').matches
  );
}

export function messageMainWrapper(userRole = 'Gamer', userName = 'Stranger', userColor = '#8e5a1f', gameId = 0){
  const wrapper = {
    'gameId': gameId,
    'user': {
      'userRole': userRole,
      'userName': userName,
      'userColor': userColor,
    }
  };

  return wrapper;  
}

export function isValidJSON(str) {
  try {
      JSON.parse(str);
      return true;
  } catch (e) {
      return false;
  }
}
