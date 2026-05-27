import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ users }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Users
                </h2>
            }
        >
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-xs sm:rounded-lg">
                        <div className="overflow-hidden overflow-x-auto border-b border-gray-200 bg-white p-6">
                            <div className="min-w-full align-middle">
                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead>
                                        <tr>
                                            <th className="bg-gray-50 px-6 py-3 text-left">
                                                <span className="text-xs font-medium uppercase leading-4 tracking-wider text-gray-500">
                                                    Name
                                                </span>
                                            </th>
                                            <th className="bg-gray-50 px-6 py-3 text-left">
                                                <span className="text-xs font-medium uppercase leading-4 tracking-wider text-gray-500">
                                                    Email
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200 divide-solid bg-white">
                                        {users.data.map((user) => (
                                            <tr key={user.id} className="bg-white">
                                                <td className="px-6 py-4 text-sm leading-5 whitespace-nowrap text-gray-900">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm leading-5 whitespace-nowrap text-gray-900">
                                                    {user.email}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {users.links.map((link, index) => {
                                    const isDisabled = link.url === null;

                                    return (
                                        <span key={`${link.label}-${index}`}>
                                            {isDisabled ? (
                                                <span
                                                    className="inline-flex cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-400"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ) : (
                                                <Link
                                                    href={link.url}
                                                    className={`inline-flex rounded-md border px-3 py-2 text-sm ${
                                                        link.active
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                    preserveScroll
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
