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
    expect(screen.getByText("Gallery")).toBeInTheDocument(); 
    expect(screen.getByText("Metrics")).toBeInTheDocument();
    expect(screen.getByText("SwipeToConfirm")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("applies active styles to the current page link", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/images"); 

    render(<Sidebar />);
    
    const activeLink = screen.getByText("Gallery").closest("a");
    expect(activeLink).toHaveClass("bg-gradient-to-r from-purple-500 to-indigo-600"); 
  });
});












