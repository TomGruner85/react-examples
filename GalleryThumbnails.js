import { useSelector } from "react-redux";
import { getActiveVehicleId } from "../redux/slices/vehicleSlice";

const VehicleThumbnails = (props) => {
  const activeVehicleId = useSelector(getActiveVehicleId)

  const vehicles = props.vehicles.map((vehicle) => {
    const classNames = activeVehicleId === vehicle._id ? "gallery__thumbnails-listItem gallery__thumbnails-listItem--active" : "gallery__thumbnails-listItem"
    const apiURL = process.env.REACT_APP_API
    const avatarPath = vehicle.hasAvatar ? `${apiURL}/bikes/${vehicle._id}/avatar?${Date.now()}` : '/img/dirt_bike_pure.jpg'
    return (
      <li key={vehicle._id} className={classNames} onClick={props.selectVehicle.bind(null, vehicle._id)}>
        <img
          src={avatarPath}
          className="gallery__thumbnails-img"
          alt="gallery thumbnail"
        />
        <div className="gallery__thumbnail-container">
            <p className="gallery__thumbnail-container-text">{vehicle.model}</p>
        </div>
      </li>
    );
  });

  return (
    <ul className="gallery__thumbnails-list">
        {vehicles}
    </ul>
  )
};

export default VehicleThumbnails;