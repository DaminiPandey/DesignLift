import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
    setGithubUrl,
    startAnalysis,
    analysisSuccess,
    analysisError,
} from "@/store/slices/analysisSlice";
import { Switch } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { Button } from "@/Components/ui/button";

export default function Dashboard() {
    const dispatch = useDispatch();
    const { githubUrl, loading, analysis, error } = useSelector(
        (state) => state.analysis
    );
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchAnalysis, setBranchAnalysis] = useState({});
    const [showBranches, setShowBranches] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [analyzingBranch, setAnalyzingBranch] = useState(null);
    const branchesPerPage = 10;

    useEffect(() => {
        const fetchBranches = async () => {
            if (!githubUrl) return;

            try {
                const urlParts = githubUrl
                    .replace("https://github.com/", "")
                    .replace(".git", "")
                    .split("/");

                if (urlParts.length !== 2) return;

                const [owner, repo] = urlParts;
                const response = await axios.get(
                    `https://api.github.com/repos/${owner}/${repo}/branches`,
                    {
                        headers: {
                            Accept: "application/vnd.github.v3+json",
                        },
                    }
                );

                setBranches(response.data);
            } catch (error) {
                console.error("Failed to fetch branches:", error);
            }
        };

        fetchBranches();
    }, [githubUrl]);

    const analyzeBranch = async (branchName) => {
        setSelectedBranch(branchName);
        setAnalyzingBranch(branchName);
        try {
            const urlParts = githubUrl
                .replace("https://github.com/", "")
                .replace(".git", "")
                .split("/");

            const [owner, repo] = urlParts;
            const response = await axios.post("/analyze", {
                repository_name: `${owner}/${repo}`,
                branch: branchName,
            });

            setBranchAnalysis({
                ...branchAnalysis,
                [branchName]: response.data.analysis,
            });

            window.location.href = `/${branchName}/stats`;
        } catch (error) {
            console.error("Failed to analyze branch:", error);
            setAnalyzingBranch(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(startAnalysis());

        try {
            const urlParts = githubUrl
                .replace("https://github.com/", "")
                .replace(".git", "")
                .split("/");

            if (urlParts.length !== 2) {
                throw new Error(
                    "Invalid GitHub URL format. Please use: https://github.com/owner/repository"
                );
            }

            const [owner, repo] = urlParts;
            const repoFullName = `${owner}/${repo}`;

            const response = await axios.post("/analyze", {
                repository_name: repoFullName,
            });

            dispatch(analysisSuccess(response.data.analysis));
            router.visit(route("metrics"));
        } catch (error) {
            dispatch(
                analysisError(error.response?.data?.message || error.message)
            );
        }
    };

    const indexOfLastBranch = currentPage * branchesPerPage;
    const indexOfFirstBranch = indexOfLastBranch - branchesPerPage;
    const currentBranches = branches.slice(
        indexOfFirstBranch,
        indexOfLastBranch
    );
    const totalPages = Math.ceil(branches.length / branchesPerPage);

    return (
        <AuthenticatedLayout>
            <Head title="Repository Analysis" />

            <div className="py-12 w-full">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="githubUrl"
                                        className="block text-sm font-medium text-typography-900"
                                    >
                                        GitHub Repository URL
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="githubUrl"
                                            id="githubUrl"
                                            className="block w-full rounded-md bg-background-50 text-typography-900 border-outline-200 shadow-sm focus:border-outline-200 focus:ring-outline-200 sm:text-sm"
                                            placeholder="https://github.com/owner/repository"
                                            value={githubUrl}
                                            onChange={(e) =>
                                                dispatch(
                                                    setGithubUrl(e.target.value)
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`inline-flex justify-center text-typography-900 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-0 active:bg-blue-800 focus:ring-gray-600 focus:ring-offset-0 ${
                                        loading
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    {loading
                                        ? "Analyzing..."
                                        : "Analyze Repository"}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-md">
                                    {error}
                                </div>
                            )}

                            {/* {analysis && (
                                <div className="mt-8 space-y-6">
                                    <h3 className="text-lg font-medium">
                                        Analysis Results
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Commit Frequency
                                            </h4>
                                            <p className="mt-1 text-2xl font-semibold">
                                                {analysis.commit_frequency.toFixed(
                                                    2
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                commits per week
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Code Churn
                                            </h4>
                                            <p className="mt-1 text-2xl font-semibold">
                                                {analysis.code_churn.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                lines changed per week
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Files Analyzed
                                            </h4>
                                            <p className="mt-1 text-2xl font-semibold">
                                                {
                                                    analysis.summary
                                                        .files_analyzed
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {analysis.file_analyses &&
                                        Object.keys(analysis.file_analyses)
                                            .length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-lg font-medium mb-4">
                                                    File Analysis
                                                </h4>
                                                <div className="space-y-4">
                                                    {Object.entries(
                                                        analysis.file_analyses
                                                    ).map(
                                                        ([
                                                            filename,
                                                            fileAnalysis,
                                                        ]) => (
                                                            <div
                                                                key={filename}
                                                                className="bg-gray-50 p-4 rounded-lg"
                                                            >
                                                                <h5 className="font-medium">
                                                                    {filename}
                                                                </h5>
                                                                <div className="mt-2 grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Complexity
                                                                            Score
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                fileAnalysis.complexity_score
                                                                            }
                                                                            /10
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Quality
                                                                            Score
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                fileAnalysis.quality_score
                                                                            }
                                                                            /10
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {fileAnalysis.suggestions && (
                                                                    <div className="mt-2">
                                                                        <p className="text-sm text-gray-500">
                                                                            Suggestions:
                                                                        </p>
                                                                        <ul className="mt-1 text-sm list-disc list-inside">
                                                                            {fileAnalysis.suggestions.map(
                                                                                (
                                                                                    suggestion,
                                                                                    index
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            suggestion
                                                                                        }
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>

            {branches.length > 0 && (
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 mt-1 w-full">
                    <div className="bg-background-50 rounded-lg shadow-sm p-6 mb-10">
                        <div className="flex items-center justify-between ">
                            <h3 className="text-lg font-medium text-typography-900">
                                Repository Branches
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-typography-500">
                                    Show Branches
                                </span>
                                <Switch
                                    checked={showBranches}
                                    onChange={setShowBranches}
                                    className={`${
                                        showBranches
                                            ? "bg-green-700"
                                            : "bg-background-200"
                                    } relative inline-flex h-6 w-11 items-center focus-visible:ring-0 focus:ring-offset-0 rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-indigo-500`}
                                >
                                    <span
                                        className={`${
                                            showBranches
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>
                        </div>

                        {showBranches && (
                            <>
                                <div className="space-y-4 my-4">
                                    {currentBranches.map((branch) => (
                                        <div
                                            key={branch.name}
                                            className="bg-background-100 rounded-lg p-4 py-3  border-gray-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="gray"
                                                        stroke-width="2"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        class="lucide lucide-git-branch"
                                                    >
                                                        <line
                                                            x1="6"
                                                            x2="6"
                                                            y1="3"
                                                            y2="15"
                                                        />
                                                        <circle
                                                            cx="18"
                                                            cy="6"
                                                            r="3"
                                                        />
                                                        <circle
                                                            cx="6"
                                                            cy="18"
                                                            r="3"
                                                        />
                                                        <path d="M18 9a9 9 0 0 1-9 9" />
                                                    </svg>
                                                    <span className="font-medium text-typography-700">
                                                        {branch.name}
                                                    </span>
                                                </div>
                                                <Button
                                                    onClick={() =>
                                                        analyzeBranch(
                                                            branch.name
                                                        )
                                                    }
                                                    variant="outline"
                                                    disabled={
                                                        analyzingBranch ===
                                                        branch.name
                                                    }
                                                    className={`px-4 py-2 rounded-md focus:ring-0 focus-visible:ring-2 focus-visible:ring-gray-500 text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                                        analyzingBranch ===
                                                        branch.name
                                                            ? "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
                                                            : branchAnalysis[
                                                                  branch.name
                                                              ]
                                                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                                            : "bg-background-0 text-typography-700 hover:bg-background-0 hover:border-outline-300 active:border-outline-400 hover:text-typography-900 border border-outline-200 shadow-sm"
                                                    }`}
                                                >
                                                    {analyzingBranch ===
                                                    branch.name ? (
                                                        <>
                                                            <svg
                                                                className="animate-spin h-4 w-4 text-gray-400"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="3"
                                                                />
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                />
                                                            </svg>
                                                            <span>
                                                                Analyzing...
                                                            </span>
                                                        </>
                                                    ) : branchAnalysis[
                                                          branch.name
                                                      ] ? (
                                                        <>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M9 5l7 7-7 7"
                                                                />
                                                            </svg>
                                                            <span>
                                                                View Results
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>
                                                                Analyze Branch
                                                            </span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-outline-200 pt-4">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                                            currentPage === 1
                                                ? "text-typography-300 cursor-not-allowed"
                                                : "text-typography-700 hover:bg-background-100"
                                        }`}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        <span>Previous</span>
                                    </button>
                                    <span className="text-sm text-typography-500">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                                            currentPage === totalPages
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span>Next</span>
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
