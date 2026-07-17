import trackConfig from '../data/varTrack.json';

export function getTrackingConfig(frameID) {
    const idx = frameID.lastIndexOf('_');
    return idx === -1 ? trackConfig[frameID] : trackConfig[frameID.slice(0, idx)] || null;
    // const baseName = frameID?.replace(/_\d+$/, '') || '';
    // return trackConfig[baseName] || null;
}