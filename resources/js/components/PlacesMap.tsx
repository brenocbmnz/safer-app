/// <reference types="@types/google.maps" />
import { useCallback, useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '@/utils/googleMapsLoader';
import type { GooglePlaceSuggestion, Place, ViewportBounds } from '@/types/place';
import { AMENITIES_LABELS } from '@/config/options';

type Props = {
    lugares: Place[];
    selecionadoId: string | null;
    onSelect: (id: string) => void;
    onMapClick?: (latitude: number, longitude: number) => void;
    onViewportChange?: (payload: {
        type: 'init' | 'move';
        bounds: ViewportBounds;
        center: { latitude: number; longitude: number };
        zoom: number;
    }) => void;
    viewportCommand?: {
        id: number;
        center: [number, number];
        zoom?: number;
        animate?: boolean;
    } | null;
    sugestoesGoogle?: GooglePlaceSuggestion[];
    onGooglePlaceSelect?: (suggestion: GooglePlaceSuggestion) => void;
};

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: -28.6775, lng: -49.3692 };
const DEFAULT_ZOOM = 13;
const MARKER_ICON_URL = '/design/pride-location.png';

export function PlacesMap({
    lugares,
    selecionadoId,
    onSelect,
    onMapClick,
    onViewportChange,
    viewportCommand,
    sugestoesGoogle = [],
    onGooglePlaceSelect,
}: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
    const googleMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const lastCommandId = useRef<number>(-1);

    // Load Google Maps
    useEffect(() => {
        loadGoogleMapsApi()
            .then(() => setMapReady(true))
            .catch((e: Error) => setMapError(e.message));
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapReady || !mapRef.current || mapInstanceRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            disableDefaultUI: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        const emitViewport = (type: 'init' | 'move') => {
            const bounds = map.getBounds();
            const center = map.getCenter();
            if (!bounds || !center) return;
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            onViewportChange?.({
                type,
                bounds: {
                    norte: ne.lat(),
                    sul: sw.lat(),
                    leste: ne.lng(),
                    oeste: sw.lng(),
                },
                center: { latitude: center.lat(), longitude: center.lng() },
                zoom: map.getZoom() ?? DEFAULT_ZOOM,
            });
        };

        google.maps.event.addListenerOnce(map, 'idle', () => emitViewport('init'));
        map.addListener('idle', () => emitViewport('move'));

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
            const iconEvent = e as google.maps.IconMouseEvent;
            if (iconEvent.placeId && onGooglePlaceSelect) {
                e.stop();
                onGooglePlaceSelect({
                    placeId: iconEvent.placeId,
                    nome: '',
                    endereco: '',
                    latitude: e.latLng?.lat() ?? 0,
                    longitude: e.latLng?.lng() ?? 0,
                    tipos: [],
                    origem: 'google',
                });
            } else if (e.latLng && onMapClick) {
                onMapClick(e.latLng.lat(), e.latLng.lng());
            }
        });
    }, [mapReady, onMapClick, onViewportChange, onGooglePlaceSelect]);

    // Sync place markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapReady) return;

        const existingKeys = new Set(markersRef.current.keys());
        const newKeys = new Set(lugares.map((l) => l.id));

        // Remove stale markers
        for (const key of existingKeys) {
            if (!newKeys.has(key)) {
                markersRef.current.get(key)?.setMap(null);
                markersRef.current.delete(key);
            }
        }

        const iconUrl = MARKER_ICON_URL;

        for (const lugar of lugares) {
            if (markersRef.current.has(lugar.id)) {
                const marker = markersRef.current.get(lugar.id)!;
                const selected = selecionadoId === lugar.id;
                marker.setZIndex(selected ? 999 : 1);
                marker.setIcon({
                    url: iconUrl,
                    scaledSize: new google.maps.Size(selected ? 40 : 32, selected ? 40 : 32),
                    anchor: new google.maps.Point(selected ? 20 : 16, selected ? 20 : 16),
                });
            } else {
                const marker = new google.maps.Marker({
                    position: { lat: lugar.latitude, lng: lugar.longitude },
                    map,
                    title: lugar.nome,
                    icon: {
                        url: iconUrl,
                        scaledSize: new google.maps.Size(32, 32),
                        anchor: new google.maps.Point(16, 16),
                    },
                });

                marker.addListener('click', () => {
                    onSelect(lugar.id);
                });

                markersRef.current.set(lugar.id, marker);
            }
        }
    }, [lugares, selecionadoId, mapReady, onSelect]);

    // Sync Google suggestion markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapReady) return;

        // Clear old
        for (const m of googleMarkersRef.current.values()) m.setMap(null);
        googleMarkersRef.current.clear();

        for (const sug of sugestoesGoogle) {
            const marker = new google.maps.Marker({
                position: { lat: sug.latitude, lng: sug.longitude },
                map,
                title: sug.nome,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#4285F4',
                    fillOpacity: 0.9,
                    strokeColor: 'white',
                    strokeWeight: 2,
                },
            });

            marker.addListener('click', () => onGooglePlaceSelect?.(sug));
            googleMarkersRef.current.set(sug.placeId, marker);
        }
    }, [sugestoesGoogle, mapReady, onGooglePlaceSelect]);

    // Respond to viewport commands
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !viewportCommand || viewportCommand.id === lastCommandId.current) return;

        lastCommandId.current = viewportCommand.id;
        const [lat, lng] = viewportCommand.center;

        if (viewportCommand.animate !== false) {
            map.panTo({ lat, lng });
            if (viewportCommand.zoom !== undefined) {
                map.setZoom(viewportCommand.zoom);
            }
        } else {
            map.setCenter({ lat, lng });
            if (viewportCommand.zoom !== undefined) {
                map.setZoom(viewportCommand.zoom);
            }
        }
    }, [viewportCommand]);

    if (mapError) {
        return (
            <div className="flex h-full items-center justify-center rounded-xl bg-muted p-6 text-center">
                <div>
                    <p className="font-medium text-destructive">Erro ao carregar mapa</p>
                    <p className="mt-1 text-sm text-muted-foreground">{mapError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <div ref={mapRef} className="h-full w-full rounded-xl" />
            {!mapReady && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-muted/60">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            )}
        </div>
    );
}
