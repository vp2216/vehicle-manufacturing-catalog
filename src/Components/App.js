import "../Styles/App.css";
import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState(null);
  const [additionalData, setAdditionalData] = useState({});
  const [filter, setFilter] = useState("");
  const [filterData, setFilterData] = useState(null);

  function getData() {
    fetch(
      `https://vpic.nhtsa.dot.gov/api//vehicles/GetAllManufacturers?format=json&page=${page}`
    )
      .then((res) => res.json())
      .then((data) => {
        const allData = data.Results;
        const requiredData = allData.filter((data) => {
          return (
            data.Mfr_CommonName &&
            data.Country &&
            data.VehicleTypes.find((i) => {
              return i.IsPrimary === true;
            })?.Name
          );
        });
        setData(requiredData);
        window.scrollTo(0, 0);
      });
  }

  useEffect(() => {
    if (!searchVal) {
      setSearch(null);
      return;
    } else {
      setFilter("all");
      if (
        searchVal.includes("[") ||
        searchVal.includes("*") ||
        searchVal.includes("(") ||
        searchVal.includes(")") ||
        searchVal.match(/\\$/)
      ) {
        alert("Please dont input ( [ , * , ( , ) , //) these charecters");
        setSearchVal("");
        return;
      }
      const regex = new RegExp("^" + searchVal.toLowerCase());
      const searchResult = data.filter((i) => {
        return regex.test(i.Mfr_CommonName.toLowerCase());
      });
      setSearch(searchResult);
    }
  }, [searchVal,data]);

  useEffect(() => {
    if (!filter || filter === "all") {
      setFilterData(null);
      return;
    } else {
      setSearchVal("");
      let filterVal = "";
      if (filter === "pc") filterVal = "Passenger Car";
      else if (filter === "mpv")
        filterVal = "Multipurpose Passenger Vehicle (MPV)";
      else if (filter === "mc") filterVal = "Motorcycle";
      else if (filter === "lsv") filterVal = "Low Speed Vehicle (LSV)";
      else if (filter === "iv") filterVal = "Incomplete Vehicle";
      else if (filter === "bus") filterVal = "Bus";
      else if (filter === "truck") filterVal = "Truck";
      else if (filter === "trailer") filterVal = "Trailer";

      const searchResult = data.filter((i) => {
        return (
          i.VehicleTypes.find((i) => {
            return i.IsPrimary === true;
          }).Name.trim() === filterVal
        );
      });
      setFilterData(searchResult);
    }
  }, [filter,data]);

  useEffect(() => {
    getData();
  }, [page]);

  function setAdditional(id) {
    fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetManufacturerDetails/${id}?format=json`
    )
      .then((res) => res.json())
      .then((data) => setAdditionalData(data.Results[0]));
  }

  return (
    <div className="main">
      <div className="heading">vechicle manufactures</div>
      <div className="search-bar">
        <span>
          <label className="lable" htmlFor="search">
            Search :{" "}
          </label>
          <input
            id="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Serach Name..."
            className="search"
          />
        </span>
        <span>
          <label className="lable" htmlFor="drop">
            Filter by Vechicle Type:{" "}
          </label>
          <select
            id="drop"
            className="search drop-down"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pc">Passenger Car</option>
            <option value="mpv">Multipurpose Passenger Vehicle (MPV)</option>
            <option value="mc">Motorcycle</option>
            <option value="lsv">Low Speed Vehicle (LSV)</option>
            <option value="iv">Incomplete Vehicle</option>
            <option value="bus">Bus</option>
            <option value="truck">Truck</option>
            <option value="trailer">Trailer</option>
          </select>
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Country</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {(search || filterData ? (search ? search : filterData) : data).map(
            (data, i) => {
              return (
                <tr key={i} onClick={() => setAdditional(data.Mfr_ID)}>
                  <td>{data.Mfr_CommonName}</td>
                  <td>{data.Country}</td>
                  <td>
                    {data.VehicleTypes.find((i) => {
                      return i.IsPrimary === true;
                    }).Name.trim()}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
      {Object.keys(additionalData).length !== 0 ? (
        <div className="pop-up">
          <div className="pop-up-div">
            <span className="close" onClick={() => setAdditionalData({})}>
              X
            </span>
            <span className="additional-heading">
              {additionalData.Mfr_Name}
            </span>
            <span>{additionalData.PrincipalFirstName}</span>
            <span>{additionalData.Address}</span>
            <span>{additionalData.StateProvince}</span>
          </div>
        </div>
      ) : null}
      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1 ? true : false}
        >
          {"<"}
        </button>
        <span>{page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === 4 ? true : false}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

export default App;
