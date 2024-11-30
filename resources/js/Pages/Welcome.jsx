import { Head, Link } from "@inertiajs/react";
import { SparklesCore } from "@/Components/Sparkles";
export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document
            .getElementById("screenshot-container")
            ?.classList.add("!hidden");
        document.getElementById("docs-card")?.classList.add("!row-span-1");
        document
            .getElementById("docs-card-content")
            ?.classList.add("!flex-row");
        document.getElementById("background")?.classList.add("!hidden");
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-white text-black/50 dark:bg-black dark:text-white/50">
                <div className="flex min-h-screen flex-col ">
                    <div className="w-full max-w-2xl   px-6 lg:max-w-7xl mx-auto flex flex-col h-[100vh]">
                        <header className="flex flex-row border-b border-gray-100 gap-2 p-4 bg-white ">
                            <nav className="-mx-3 flex flex-1 justify-between">
                                {auth.user ? (
                                    <>
                                        <div className="flex shrink-0 items-center">
                                            <Link href="/">
                                                <p className="text-4xl font-bold">
                                                    &lt;/&gt;
                                                </p>
                                            </Link>
                                        </div>
                                        <Link
                                            href={route("dashboard")}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="flex-1 flex items-center justify-center">
                            <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
                                <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20">
                                    Codewiser
                                </h1>
                                <div className="w-[40rem] h-40 relative">
                                    {/* Gradients */}
                                    <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
                                    <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
                                    <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
                                    <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

                                    {/* Core component */}
                                    <SparklesCore
                                        background="transparent"
                                        minSize={0.4}
                                        maxSize={1}
                                        particleDensity={1200}
                                        className="w-full h-full"
                                        particleColor="#FFFFFF"
                                    />

                                    {/* Radial Gradient to prevent sharp edges */}
                                    <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
