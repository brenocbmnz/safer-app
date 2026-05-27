/// <reference types="@types/google.maps" />

declare global {
    interface Window {
        initGoogleMaps?: () => void;
        google?: typeof google;
    }
}

let loadPromise: Promise<typeof google> | undefined;

const DEFAULT_LIBRARIES: Array<'places' | 'geometry'> = ['places'];

export function loadGoogleMapsApi(
    libraries: Array<'places' | 'geometry'> = DEFAULT_LIBRARIES,
): Promise<typeof google> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google Maps só pode ser carregado no ambiente do navegador.'));
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

    if (!apiKey) {
        return Promise.reject(new Error('Chave do Google Maps não configurada. Adicione VITE_GOOGLE_MAPS_API_KEY no .env'));
    }

    if (!loadPromise) {
        loadPromise = new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve(window.google);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&v=weekly&loading=async&callback=initGoogleMaps`;
            script.async = true;

            window.initGoogleMaps = () => {
                delete window.initGoogleMaps;
                if (window.google && window.google.maps) {
                    resolve(window.google);
                } else {
                    reject(new Error('Google Maps API failed to initialize'));
                }
            };

            script.onerror = () => {
                delete window.initGoogleMaps;
                reject(new Error('Failed to load Google Maps script'));
            };

            document.head.appendChild(script);
        });
    }

    return loadPromise;
}
