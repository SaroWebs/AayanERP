import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Building2, Package, FileText, Users, BarChart3 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Welcome to Aayan Group ERP">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] to-[#F5F5F4]">
                <div className="container mx-auto px-4 py-8">
                    <header className="mb-12">
                        <nav className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-8 w-8 text-[#1b1b18]" />
                                <span className="text-2xl font-semibold">Aayan Group ERP</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-block rounded-lg bg-[#1b1b18] px-6 py-2 text-sm font-medium text-white hover:bg-[#2a2a25]"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="inline-block rounded-lg border border-[#1b1b18] px-6 py-2 text-sm font-medium text-[#1b1b18] hover:bg-[#1b1b18] hover:text-white"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </header>

                    <main className="w-full flex justify-between items-end gap-8 px-8">
                        <div className="flex flex-col justify-center">
                            <h1 className="mb-6 text-4xl text-slate-500 font-bold leading-tight lg:text-4xl">
                                Streamline Your Industrial Operations
                            </h1>
                            <div className="mb-8 grid grid-cols-2 gap-4">
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <Package className="mb-2 h-6 w-6 text-blue-600" />
                                    <h3 className="font-semibold">Inventory Management</h3>
                                    <p className="text-sm text-gray-600">Track all your equipment and supplies</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <FileText className="mb-2 h-6 w-6 text-green-600" />
                                    <h3 className="font-semibold">Quotation System</h3>
                                    <p className="text-sm text-gray-600">Generate and manage client quotes</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <Users className="mb-2 h-6 w-6 text-purple-600" />
                                    <h3 className="font-semibold">Client Management</h3>
                                    <p className="text-sm text-gray-600">Handle customer enquiries and orders</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <BarChart3 className="mb-2 h-6 w-6 text-orange-600" />
                                    <h3 className="font-semibold">Business Analytics</h3>
                                    <p className="text-sm text-gray-600">Track performance and growth</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="min-w-md rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
                                {!auth.user ? (
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <div className="mb-4 ">
                                            <h2 className="text-sm font-bold text-slate-900">Welcome Back</h2>
                                            <p className="text-xl font-semibold text-slate-400">Please enter details to login</p>
                                        </div>
                                        <form onSubmit={submit} className="space-y-4">
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="mt-1"
                                                    required
                                                />
                                                <InputError message={errors.email} />
                                            </div>
                                            <div>
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className="mt-1"
                                                    required
                                                />
                                                <InputError message={errors.password} />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="remember"
                                                    checked={data.remember}
                                                    onCheckedChange={(checked) => setData('remember', !!checked)}
                                                />
                                                <Label htmlFor="remember">Remember me</Label>
                                            </div>
                                            <Button type="submit" className="w-full" disabled={processing}>
                                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                Log in
                                            </Button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center p-8">
                                        <div className="text-center">
                                            <Building2 className="mx-auto mb-4 h-16 w-16 text-blue-600" />
                                            <h2 className="mb-2 text-2xl font-semibold">Aayan Group</h2>
                                            <p className="text-gray-600">
                                                Your Trusted Partner in Industrial Refractory Supplies
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
