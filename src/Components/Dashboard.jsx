import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import UpdateTask from "./UpdateTask";
import { useNavigate } from "react-router-dom";
import { BASE_API_URL } from "../../Api.config";

const Dashboard = () => {
  const { user, isAuthenticated, logout, getAccessTokenSilently } = useAuth0();
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();
  // Fetch user tasks from backend
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     fetch(`${BASE_API_URL}/todo/tasks?userId=${user.sub}`)
  //       .then((res) => res.json())
  //       .then((data) => setTasks(data.tasks || []))
  //       .catch((error) => console.error("Error fetching tasks:", error));
  //   }
  // }, [isAuthenticated, user?.sub]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (isAuthenticated && user?.sub) {
        const token = await getAccessTokenSilently(); // Replace with the actual token retrieval logic

        try {
          const res = await fetch(
            `${BASE_API_URL}/todo/tasks?userId=${user.sub}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`, // Add the Authorization header with the token
                "Content-Type": "application/json", // Ensure content type is correct (optional)
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            setTasks(data.tasks || []);
          } else {
            console.error("Error fetching tasks: ", res.statusText);
          }
        } catch (error) {
          console.error("Error fetching tasks: ", error);
        }
      }
    };

    fetchTasks();
  }, [isAuthenticated, user?.sub]);

  // Add new task
  const addTask = async () => {
    if (!name.trim() || !newDescription.trim()) return;
    const token = await getAccessTokenSilently();
    const response = await fetch(`${BASE_API_URL}/todo/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.sub,
        name: name,
        description: newDescription,
        status: newStatus,
      }),
    });
    const data = await response.json();
    setTasks([...tasks, data.task]);
    setName("");
    setNewDescription("");
    setNewStatus("Pending");
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    const token = await getAccessTokenSilently();
    await fetch(`${BASE_API_URL}/todo/task/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setTasks(tasks.filter((task) => task._id !== taskId));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      {/* User Info Section */}
      <div className="w-full bg-white shadow-lg rounded-xl p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-gray-600">{user?.email}</p>
        <button
          onClick={() => logout()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Add Task Section */}
      <div className="w-full bg-white shadow-lg rounded-xl mt-6 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Add Task</h2>

        {/* Task Input */}
        <div className="flex flex-col gap-2 mt-4">
          <input
            type="text"
            placeholder="Task Title..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none"
          />
          <textarea
            placeholder="Task Description..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none"
          />
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="w-full bg-white shadow-lg rounded-xl mt-6 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>

        <ul className="mt-4">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center">No tasks yet!</p>
          ) : (
            tasks.map((task) => (
              <li
                key={task._id}
                className="flex justify-between items-center bg-gray-50 p-2 rounded-md mt-2 shadow cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div>
                  <p className="text-gray-700 font-semibold">{task.name}</p>
                  <p className="text-gray-600 text-sm">{task.description}</p>
                  <span
                    className={`text-xs p-1 rounded-md ${
                      task.status === "Completed"
                        ? "bg-green-200"
                        : task.status === "In Progress"
                        ? "bg-yellow-200"
                        : "bg-red-200"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/updatetask/${task._id}`);
                  }}
                  className="bg-green-600 px-6 py-3 rounded-2xl text-white "
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task._id);
                  }}
                  className="text-white px-6 py-3 rounded-2xl bg-red-600"
                >
                  Delete Task
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Update Task Modal */}
      {selectedTask && (
        <UpdateTask
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          setTasks={setTasks}
        />
      )}
    </div>
  );
};

export default Dashboard;
