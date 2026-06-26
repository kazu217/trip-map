import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { spotTypeColors } from '../constants/categories';
import { colors, radius, spacing } from '../constants/theme';
import { isGoogleMapsConfigured } from '../services/appConfig';
import { Spot } from '../types/models';
import { compareSpotsByTime } from '../utils/date';

declare const require: (moduleName: string) => any;

type MapPreviewProps = {
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
};

type MapPoint = {
  id: string;
  spot: Spot;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: Spot['type'];
};

const loadNativeMaps = () => {
  try {
    return require('react-native-maps');
  } catch {
    return null;
  }
};

const coordinateSpots = (spots: Spot[]) =>
  (spots.filter((spot) => typeof spot.lat === 'number' && typeof spot.lng === 'number') as Array<
    Spot & { lat: number; lng: number }
  >).sort(compareSpotsByTime);

const mapPoints = (spots: Spot[]): MapPoint[] =>
  coordinateSpots(spots).flatMap((spot) => {
    const points: MapPoint[] = [
      {
        id: spot.id,
        spot,
        name: spot.name,
        address: spot.address,
        lat: spot.lat,
        lng: spot.lng,
        type: spot.type
      }
    ];

    if (typeof spot.destinationLat === 'number' && typeof spot.destinationLng === 'number') {
      points.push({
        id: `${spot.id}_destination`,
        spot,
        name: `${spot.name} 到着地`,
        address: spot.destinationAddress || '',
        lat: spot.destinationLat,
        lng: spot.destinationLng,
        type: spot.type
      });
    }

    return points;
  });

export const MapPreview = ({ spots, onSpotPress }: MapPreviewProps) => {
  const points = coordinateSpots(spots);
  const allPoints = mapPoints(spots);
  const maps = isGoogleMapsConfigured() ? loadNativeMaps() : null;
  const NativeMap = maps?.default;
  const Marker = maps?.Marker;
  const Polyline = maps?.Polyline;
  const googleProvider = maps?.PROVIDER_GOOGLE;

  if (NativeMap && Marker && allPoints.length > 0) {
    const latValues = allPoints.map((point) => point.lat);
    const lngValues = allPoints.map((point) => point.lng);
    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const minLng = Math.min(...lngValues);
    const maxLng = Math.max(...lngValues);
    const latitude = (minLat + maxLat) / 2;
    const longitude = (minLng + maxLng) / 2;
    const latitudeDelta = Math.min(170, Math.max(0.06, (maxLat - minLat) * 1.5));
    const longitudeDelta = Math.min(170, Math.max(0.06, (maxLng - minLng) * 1.5));
    const coordinates = points.map((spot) => ({ latitude: spot.lat, longitude: spot.lng }));
    const routeSegments = points
      .filter((spot) => typeof spot.destinationLat === 'number' && typeof spot.destinationLng === 'number')
      .map((spot) => [
        { latitude: spot.lat, longitude: spot.lng },
        { latitude: spot.destinationLat as number, longitude: spot.destinationLng as number }
      ]);

    return (
      <View style={styles.nativeWrap}>
        <NativeMap
          style={styles.nativeMap}
          provider={Platform.OS === 'android' ? googleProvider : undefined}
          mapType="standard"
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta
          }}
        >
          {coordinates.length > 1 ? <Polyline coordinates={coordinates} strokeColor={colors.route} strokeWidth={3} /> : null}
          {routeSegments.map((segment, index) => (
            <Polyline key={`route_${index}`} coordinates={segment} strokeColor={colors.primary} strokeWidth={4} />
          ))}
          {allPoints.map((point) => (
            <Marker
              key={point.id}
              title={point.name}
              description={point.address}
              pinColor={spotTypeColors[point.type]}
              coordinate={{ latitude: point.lat, longitude: point.lng }}
              onPress={() => onSpotPress(point.spot)}
            />
          ))}
        </NativeMap>
      </View>
    );
  }

  if (!points.length) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>座標付きスポットがありません</Text>
        <Text style={styles.fallbackText}>スポットフォームで緯度・経度を入れると、ここにピンが表示されます。</Text>
      </View>
    );
  }

  const latValues = allPoints.map((point) => point.lat);
  const lngValues = allPoints.map((point) => point.lng);
  const minLat = Math.min(...latValues);
  const maxLat = Math.max(...latValues);
  const minLng = Math.min(...lngValues);
  const maxLng = Math.max(...lngValues);
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lngRange = Math.max(maxLng - minLng, 0.01);

  return (
    <View style={styles.fallbackMap}>
      {allPoints.map((point, index) => {
        const left = 8 + ((point.lng - minLng) / lngRange) * 82;
        const top = 8 + ((maxLat - point.lat) / latRange) * 82;
        return (
          <Pressable
            key={point.id}
            onPress={() => onSpotPress(point.spot)}
            style={[styles.pin, { left: `${left}%`, top: `${top}%`, backgroundColor: spotTypeColors[point.type] }]}
          >
            <Text style={styles.pinText}>{index + 1}</Text>
          </Pressable>
        );
      })}
      <Text style={styles.mapHint}>Map preview</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeWrap: {
    height: 360,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  nativeMap: {
    flex: 1
  },
  fallback: {
    minHeight: 240,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm
  },
  fallbackTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center'
  },
  fallbackText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  fallbackMap: {
    height: 320,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft
  },
  pin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface
  },
  pinText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900'
  },
  mapHint: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800'
  }
});
