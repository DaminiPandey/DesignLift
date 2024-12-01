import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-background-700 text-typography-900 focus:border-background-900 '
                    : 'border-transparent text-typography-500 hover:border-outline-500 hover:text-typography-700 focus:border-outline-300 focus:text-typography-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
