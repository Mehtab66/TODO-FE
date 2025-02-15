import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../Components/Dashboard";
import { useAuth0 } from "@auth0/auth0-react";
import { MemoryRouter } from "react-router-dom";
import { BASE_API_URL } from "../../Api.config";

// Mock useAuth0
jest.mock("@auth0/auth0-react");

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock global fetch
global.fetch = jest.fn();

describe("Dashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test

    useAuth0.mockReturnValue({
      isAuthenticated: true,
      user: {
        name: "John Doe",
        sub: "auth0|123",
        email: "johndoe@example.com",
      },
      getAccessTokenSilently: jest.fn().mockResolvedValue("mocked_token"),
      logout: jest.fn(),
    });
  });

  test("adds a task successfully", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        task: {
          _id: "1",
          name: "Test Task",
          description: "Test Description",
          status: "Pending",
        },
      }),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Task Title..."), {
      target: { value: "Test Task" },
    });

    fireEvent.change(screen.getByPlaceholderText("Task Description..."), {
      target: { value: "Test Description" },
    });

    // Click "Add Task" button
    fireEvent.click(screen.getByText("Add Task"));

    // Wait for task to be added
    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    // Verify API call
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_API_URL}/todo/task`,
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  test("deletes a task successfully", async () => {
    // Mock initial task list
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tasks: [
          {
            _id: "1",
            name: "Task to Delete",
            description: "Some description",
            status: "Pending",
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Ensure task appears in UI
    await waitFor(() => {
      expect(screen.getByText("Task to Delete")).toBeInTheDocument();
    });

    // Mock delete API response
    fetch.mockResolvedValueOnce({ ok: true });

    // Click delete button
    fireEvent.click(screen.getByText("Delete Task"));

    // Ensure task disappears from UI
    await waitFor(() => {
      expect(screen.queryByText("Task to Delete")).not.toBeInTheDocument();
    });

    // Verify delete API call
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_API_URL}/todo/task/1`,
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });
});
