import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";

import NavLink from "@/Components/NavLink";
import { AnimatedTooltip } from "@/Components/AnimatedTooltip";

import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { analysis } = useSelector((state) => state.analysis);
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

 
    const people = [
        {
            id: 1,
            name: user?.name,
            designation: user.email,
            image: user?.image,
        },
    ];
    return (
        <div className="min-h-screen min-w-screen bg-background-0 flex flex-1  flex-col relative">
            <nav className="border-b-[0.5px] border-gray-800 bg-background-0">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <p className="text-4xl font-bold text-white">
                                            &lt;/&gt;
                                        </p>
                                    </Link>
                                </div>

                                <div className="hidden space-x-8 text-white sm:-my-px sm:ms-8 sm:flex">
                                    <NavLink
                                        href={route("dashboard")}
                                        active={route().current("dashboard")}
                                        className="text-white"
                                    >
                                        Dashboard
                                    </NavLink>
                                    <NavLink
                                        href={route("overview.stats")}
                                        active={route().current("overview.stats")}
                                        className="text-white"
                                    >
                                        Overview Stats
                                    </NavLink>
                                    <NavLink
                                        href={route("pr.analysis")}
                                        active={route().current("pr.analysis")}
                                        className="text-white"
                                    >
                                        PR Analysis
                                    </NavLink>
                                    {analysis && (
                                        <NavLink
                                            href={route("metrics")}
                                            active={route().current("metrics")}
                                        >
                                            Metrics
                                        </NavLink>
                                    )}
                                    <NavLink
                                        href={route("contributors")}
                                        active={route().current("contributors")}
                                        className="text-white"
                                    >
                                        Contributors
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:ms-6 sm:flex sm:items-center ">
                            <div className="relative ms-3">
                                <Dropdown className="text-black bg-red-500">
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex gap-2 items-center rounded-md border border-transparent bg-none px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <AnimatedTooltip
                                                        items={people}
                                                    />
                                                </div>

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="#ffffff"
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    class="lucide lucide-chevron-down"
                                                >
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content className="text-black bg-black hover:bg-black">
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="bg-black"
                                        >
                                            Logout
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route("metrics")}
                            active={route().current("metrics")}
                        >
                            Metrics
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                                className="bg-red-500"
                            >
                                Logout
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="flex-1 h-full flex flex-col">{children}</main>
        </div>
    );
}
