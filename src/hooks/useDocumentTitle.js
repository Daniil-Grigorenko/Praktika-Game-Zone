import { useEffect } from 'react';

const APP_NAME = 'GameZone';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;

    return () => { document.title = previous; };
  }, [title]);
}