import reduxStore from "../redux/store/reduxStore";

import { editTask as editTaskDispatch, bulkUpdateLastCompleted } from "../redux/slices/taskSlice";
import {
  populateStore,
  getActiveVehicle
} from "../redux/slices/vehicleSlice";
import getUsageUnit from "../util/getUsageUnit";

const API_URL = process.env.REACT_APP_API;

const getUserToken = () => {
  const state = reduxStore.getState();
  return state.auth.token;
};

const prepareTaskUtil = (task, hours) => {
  const activeVehicle = getActiveVehicle(reduxStore.getState());
  const unit = getUsageUnit(activeVehicle.usageUnit);
  const interval = unit === 'mls' ? parseInt(task.interval) / 30 : unit === 'km' ? parseInt(task.interval) / 50 : hours;

  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const lastUpdate = `${month}/${day}/${year}`;

  const lastCompleted = {
    hours: parseInt(hours),
    date: lastUpdate,
  };

  const updatedTask = {
    vehicleId: activeVehicle._id,
    task: {
      ...task,
      interval,
      lastCompleted,
    },
  };

  return{
    lastCompleted,
    updatedTask
  }
}

export const getAllVehicles = async () => {
  const userToken = getUserToken();
  const response = await fetch(`${API_URL}/bikes`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not update task.");
  }

  reduxStore.dispatch(populateStore(data));

  return data;
};

export const editTask = async ({ task, vehicleId }) => {
  const activeVehicle = getActiveVehicle(reduxStore.getState())
  const userToken = getUserToken();
  const unit = getUsageUnit(activeVehicle.usageUnit);
  const interval = unit === 'mls' ? parseInt(task.interval) / 30 : unit === 'km' ? parseInt(task.interval) / 50 : task.interval;
  const response = await fetch(`${API_URL}/tasks/${task._id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: task.description,
      interval,
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not update task.");
  }

  const newTask = {
    vehicleId,
    task: {
      ...task,
      interval,
      lastCompleted: undefined,
    },
  };

  reduxStore.dispatch(editTaskDispatch(newTask));

  return 'success';
};

export const createCustomTask = async (task) => {
  const activeVehicle = getActiveVehicle(reduxStore.getState())
  const userToken = getUserToken()

  const response = await fetch(`${API_URL}/tasks/${activeVehicle._id}`,{
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(task)
  })

  if(!response.ok){
    throw new Error("Error creating task. Please try again later")
  }

  const data = await response.json()

  return data
}

export const updateLastCompleted = async ({task, hours}) => {
  const userToken = getUserToken();

  const {lastCompleted, updatedTask} = prepareTaskUtil(task, hours)

  const response = await fetch(`${API_URL}/tasks/lastCompleted/${task._id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lastCompleted }),
  });

  if (!response.ok) {
    throw new Error("An error occured. Please try again later.");
  }

  reduxStore.dispatch(editTaskDispatch(updatedTask));

  return 'success';
};

export const updateLastCompletedBulk = async ({tasks, hours}) => {
  const userToken = getUserToken()
  const activeVehicle = getActiveVehicle(reduxStore.getState())

  const preparedTasks = tasks.map((task) => {
    const {lastCompleted} = prepareTaskUtil(task, hours)
    return  {
      ...task,
      bike: activeVehicle._id,
      lastCompleted: [{
        ...lastCompleted
      }]
    }
  })
  
  const response = await fetch(`${API_URL}/tasks/lastCompleted`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': "application/json"
    },
    body: JSON.stringify({tasks: preparedTasks})
  })

  if(!response.ok){
    throw new Error("An error occured. Please try again later.")
  }

  reduxStore.dispatch(bulkUpdateLastCompleted(preparedTasks))

  return 'success'
}