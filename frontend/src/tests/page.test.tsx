import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import Home from "@/app/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Home page", () => {
  it("renders the home page with title and description", () => {
    render(<Home />);
    expect(screen.getByText(/Image Classification, Simplified/i)).toBeInTheDocument();
    expect(screen.getByText(/Instantly detect objects with AI-driven image recognition/i)).toBeInTheDocument();
  });

  it("navigates to /dashboard/images when 'Get Started' is clicked", () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(<Home />);
    fireEvent.click(screen.getByText(/Get Started/i));
    expect(push).toHaveBeenCalledWith("/dashboard/images");
  });

//   it("displays dynamically generated tags", async () => {
//     render(<Home />);
    
//     // Wait for the tags to appear after some time.
//     // await waitFor(() => expect(screen.getAllByText(/Cat|Dog|Car|Tree|Building|Person|Bird/i)).toHaveLength(15));
//     await waitFor(() => expect(screen.getAllByText(/Cat|Dog|Car|Tree|Building|Person|Bird/i)).toHaveLength(16));

//     // Check that a random set of tags has been rendered.
//     expect(screen.getByText(/Cat/i)).toBeInTheDocument();
//   });

    it("displays dynamically generated tags", async () => {
        render(<Home />);
    
        // Wait for the tags to appear after some time.
        await waitFor(() => expect(screen.getAllByText(/Cat|Dog|Car|Tree|Building|Person|Bird/i)).toHaveLength(16));
    
        // Check that a random set of tags has been rendered.
        const catTags = screen.getAllByText(/Cat/i);
        expect(catTags.length).toBeGreaterThan(0); // Ensure at least one "Cat" tag is present
  });
  

});
