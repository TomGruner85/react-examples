import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight } from "react-feather";
import VehicleThumbnails from "../../components/vehicles/VehiclesThumbnails";
import {
  getAllVehicles,
  setActiveVehicleId,
} from "../redux/slices/vehicleSlice";
import dummyData from "../../img/dummyData";

const VehiclesGallery = () => {
  const [vehicles, setVehicles] = useState([]);
  const [displayedVehicle, setDisplayedVehicle] = useState({});
  const apiURL = process.env.REACT_APP_API;
  const reduxVehicles = useSelector(getAllVehicles);
  const dispatch = useDispatch();
  const dummy = dummyData();

  useEffect(() => {
    const vehicleIndex = reduxVehicles.findIndex(
      (vehicle) => vehicle._id === displayedVehicle._id
    );
    if (vehicleIndex === -1) {
      if (reduxVehicles.length > 0) {
        setVehicles(reduxVehicles);
        setDisplayedVehicle(reduxVehicles[0]);
        dispatch(setActiveVehicleId(reduxVehicles[0]._id));
      } else {
        if (displayedVehicle._id !== 1) {
          setVehicles([]);
          setDisplayedVehicle(dummy[0]);
          dispatch(setActiveVehicleId(dummy[0]._id));
        }
      }
    } else {
      setDisplayedVehicle(reduxVehicles[vehicleIndex]);
      setVehicles(reduxVehicles);
    }

    if (reduxVehicles.length > 0 && !displayedVehicle._id) {
      dispatch(setActiveVehicleId(reduxVehicles[0]._id));
    }

    if(vehicles.length !== reduxVehicles.length){
      setVehicles(reduxVehicles)
    }
  }, [
    reduxVehicles,
    vehicles,
    apiURL,
    displayedVehicle,
    dispatch,
    dummy
  ]);

  const showAddVehicleFormHandler = () => {
    if(displayedVehicle._id === dummy[0]._id){
      document.getElementById('addVehicleLink').click()
    }
  }

  const selectVehicleHandler = (vehicleId) => {
    const vehicleIndex = vehicles.findIndex(
      (vehicle) => vehicle._id === vehicleId
    );
    setDisplayedVehicle(vehicles[vehicleIndex]);
    dispatch(setActiveVehicleId(vehicleId));
  };

  const forwardHandler = () => {
    const vehicleIndex = vehicles.findIndex(
      (vehicle) => vehicle._id === displayedVehicle._id
    );
    if (vehicleIndex < vehicles.length - 1) {
      setDisplayedVehicle(vehicles[vehicleIndex + 1]);
      dispatch(setActiveVehicleId(vehicles[vehicleIndex + 1]._id));
    } else {
      setDisplayedVehicle(vehicles[0]);
      dispatch(setActiveVehicleId(vehicles[0]._id));
    }
  };

  const backwardHandler = () => {
    const vehicleIndex = vehicles.findIndex(
      (vehicle) => vehicle._id === displayedVehicle._id
    );
    if (vehicleIndex - 1 >= 0) {
      setDisplayedVehicle(vehicles[vehicleIndex - 1]);
      dispatch(setActiveVehicleId(vehicles[vehicleIndex - 1]._id));
    } else {
      setDisplayedVehicle(vehicles.at(-1));
      dispatch(setActiveVehicleId(vehicles.at(-1)._id));
    }
  };
  const avatarPath = displayedVehicle.hasAvatar ? `${apiURL}/bikes/${displayedVehicle._id}/avatar?${Date.now()}` : '/img/dirt_bike_pure.jpg'
  return (
    <section className="gallery">
      <div className="gallery__bg"></div>
      <div className="u-center-text u-margin-bottom-small">
        <h2 className="heading-secondary gallery__heading" id="how_it_woks">
          Your Garage
        </h2>
      </div>
      <div
        className="gallery__main"
        onClick={showAddVehicleFormHandler}
      >
        <div className="gallery__image-container">
          <img
            src={avatarPath}
            className="gallery__main-image"
            alt="Main"
          />
        </div>
        <div
          className="gallery__nav gallery__nav--backward"
          onClick={backwardHandler}
        >
          <ChevronLeft className="gallery__nav-icon" />
        </div>
        <div
          className="gallery__nav gallery__nav--forward"
          onClick={forwardHandler}
        >
          <ChevronRight className="gallery__nav-icon" />
        </div>
        <div className="gallery__title">
          <h2 className="gallery__title-text">{displayedVehicle.type}</h2>
        </div>
        <div className="gallery__bike-description">
          <div className="gallery__bike-text">
            <h2 className="gallery__bike-text-main u-margin-bottom-small">
              <span className="gallery__bike-text-main-title">
                {displayedVehicle.year}
              </span>
              <span className="gallery__bike-text-main-title">
                {displayedVehicle.make}
              </span>
              <span className="gallery__bike-text-main-title">
                {displayedVehicle.model}
              </span>
            </h2>
            <p className="gallery__bike-text-sub">
              <span className="gallery__bike-text-sub-column">ODO:</span>
              {`${displayedVehicle.ODO} ${displayedVehicle.usageUnit}`}
            </p>
            <p className="gallery__bike-text-sub">
              <span className="gallery__bike-text-sub-column">
                Last Update:
              </span>
              {displayedVehicle.lastUpdate}
            </p>
          </div>
        </div>
      </div>

      <div className="gallery__thumbnails">
        <VehicleThumbnails
          vehicles={vehicles}
          selectVehicle={selectVehicleHandler}
        />
      </div>
    </section>
  );
};

export default VehiclesGallery;