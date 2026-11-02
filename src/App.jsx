import Navbar from "./components/Navbar";
import ItgcAgent from "./modules/itgc/ItgcAgent";
import { itgcModule } from "./modules/itgc/config.jsx";

export default function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar activeModule={itgcModule} onHome={() => {}} />
      <div style={{ flex: 1, minHeight: 0 }}>
        <ItgcAgent />
      </div>
    </div>
  );
}
