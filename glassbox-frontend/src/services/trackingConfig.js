import trackConfig from '../data/varTrack.json';

export function getTrackingConfig(frameID) {
    const baseName = frameID?.replace(/_\d+$/, '') || '';
    return trackConfig[baseName] || null;
}