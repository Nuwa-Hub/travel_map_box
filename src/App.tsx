import mapboxgl from "mapbox-gl";
import { Home } from "./containers/Home/Home";

mapboxgl.accessToken = process.env.REACT_APP_ACCESS_TOKEN ?? "";

function App() {
  return <Home />;
}

export default App;
