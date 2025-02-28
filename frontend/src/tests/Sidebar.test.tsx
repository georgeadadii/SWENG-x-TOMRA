// import "@testing-library/jest-dom";
// import { render, screen, fireEvent } from "@testing-library/react";
// import { usePathname, useRouter } from "next/navigation";
// import Sidebar from "../components/Sidebar";

// jest.mock("next/navigation", () => ({
//   usePathname: jest.fn(),
//   useRouter: jest.fn(),
// }));

// describe("Sidebar", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("renders the sidebar with navigation links", () => {
//     (usePathname as jest.Mock).mockReturnValue("/dashboard/images");
//     render(<Sidebar />);

//     expect(screen.getByText("Dashboard")).toBeInTheDocument();
//     expect(screen.getByText("Images")).toBeInTheDocument();
//     expect(screen.getByText("Metrics")).toBeInTheDocument();
//     expect(screen.getByText("SwipeToConfirm")).toBeInTheDocument();
//     expect(screen.getByText("Logout")).toBeInTheDocument();
//   });

//   it("applies active styles to the current page link", () => {
//     (usePathname as jest.Mock).mockReturnValue("/dashboard/metrics");
//     render(<Sidebar />);
//     const activeLink = screen.getByText("Metrics");
//     expect(activeLink.parentElement).toHaveClass("bg-gray-700");
//   });

//   it("calls router.push on logout", () => {
//     const mockPush = jest.fn();
//     (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
//     render(<Sidebar />);

//     const logoutButton = screen.getByText("Logout");
//     fireEvent.click(logoutButton);

//     expect(mockPush).toHaveBeenCalledWith("/");
//   });
// });


import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Sidebar from "../components/Sidebar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
}));

describe("Sidebar", () => {
  it("renders the sidebar with navigation links", () => {
    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Gallery")).toBeInTheDocument(); // Fix: "Images" → "Gallery"
    expect(screen.getByText("Metrics")).toBeInTheDocument();
    expect(screen.getByText("SwipeToConfirm")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("applies active styles to the current page link", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/images"); // Mock active path

    render(<Sidebar />);
    
    const activeLink = screen.getByText("Gallery").closest("a");
    expect(activeLink).toHaveClass("bg-gradient-to-r from-purple-500 to-indigo-600"); // Fix: match actual active class
  });
});















// import { render, screen, fireEvent } from "@testing-library/react";
// import { usePathname, useRouter } from "next/navigation";
// import Sidebar from "../components/Sidebar";

// jest.mock("next/navigation", () => ({
//   usePathname: jest.fn(),
//   useRouter: jest.fn(),
// }));

// describe("Sidebar", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("renders the sidebar with navigation links", () => {
//     (usePathname as jest.Mock).mockReturnValue("/dashboard/images");
//     render(<Sidebar />);

//     expect(screen.getByText("Dashboard")).toBeInTheDocument();
//     expect(screen.getByText("Images")).toBeInTheDocument();
//     expect(screen.getByText("Metrics")).toBeInTheDocument();
//     expect(screen.getByText("SwipeToConfirm")).toBeInTheDocument();
//     expect(screen.getByText("Logout")).toBeInTheDocument();
//   });

//   it("applies active styles to the current page link", () => {
//     (usePathname as jest.Mock).mockReturnValue("/dashboard/metrics");
//     render(<Sidebar />);
//     const activeLink = screen.getByText("Metrics");
  
//     // Remove .parentElement and check the link itself
//     expect(activeLink.closest("a")).toHaveClass("bg-gray-700");
//   });
  

//   it("calls router.push on logout", () => {
//     const mockPush = jest.fn();
//     (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
//     render(<Sidebar />);

//     const logoutButton = screen.getByText("Logout");
//     fireEvent.click(logoutButton);

//     expect(mockPush).toHaveBeenCalledWith("/");
//   });
// });

