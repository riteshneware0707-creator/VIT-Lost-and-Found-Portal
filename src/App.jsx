import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LostItems from "./pages/LostItems";
import FoundItems from "./pages/FoundItems";
import ReportItem from "./pages/ReportItem";
import ItemDetails from "./pages/ItemDetails";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/lost"
          element={<LostItems />}
        />

        <Route
          path="/found"
          element={<FoundItems />}
        />

        <Route
          path="/report"
          element={<ReportItem />}
        />

        <Route
          path="/items/:id"
          element={<ItemDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;