import { useAppContext } from "../../../context/AppContext";

const MapRenderToggle = () => {
  const { useRasterMap, setUseRasterMap } = useAppContext();

  return (
    <button
      onClick={() => setUseRasterMap(!useRasterMap)}
      aria-pressed={useRasterMap}
      aria-label={useRasterMap ? "Switch to vector map (high quality)" : "Switch to raster map (low bandwidth)"}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        useRasterMap
          ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      title={
        useRasterMap
          ? "Using Raster (Low Bandwidth)"
          : "Using Vector (High Quality)"
      }
    >
      {useRasterMap ? "🖼️" : "🗺️"}
    </button>
  );
};

export default MapRenderToggle;
