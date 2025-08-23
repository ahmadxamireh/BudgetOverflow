import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setUser } from "../../state/authSlice";
import { updateUserProfile, changeUserPassword } from "../../api/auth";
import Navbar from "../Navbar/Navbar";

export default function SettingsPage() {
    // initialize dispatch
    const dispatch = useAppDispatch();

    const user = useAppSelector((state) => state.auth.user);

    // store and manage input fields
    const [ firstName, setFirstName ] = useState(user?.firstName ?? "");
    const [ lastName, setLastName ] = useState(user?.lastName ?? "");
    const [ currentPassword, setCurrentPassword ] = useState("");
    const [ newPassword, setNewPassword ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");

    const [ message, setMessage ] = useState<string | null>(null);
    const [ error, setError ] = useState<string | null>(null);
    const [ loading, setLoading ] = useState(false);

    const handleUpdateProfile = async () => {
        setMessage(null);
        setError(null);
        setLoading(true);

        try {
            const updatedUser = await updateUserProfile({ firstName, lastName });
            dispatch(setUser(updatedUser));
            setMessage("Profile updated successfully.");
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setMessage(null);
        setError(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All password fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await changeUserPassword({ currentPassword, newPassword });
            setMessage("Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || "Password change failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar/>
            <div className="max-w-3xl mx-auto p-6 mt-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h2>

                { message && <p className="mb-4 text-green-600">{ message }</p> }
                { error && <p className="mb-4 text-red-600">{ error }</p> }

                {/* Update Profile */ }
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Update Profile</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                            <input
                                type="text"
                                value={ firstName }
                                onChange={ (e) => setFirstName(e.target.value) }
                                className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                            <input
                                type="text"
                                value={ lastName }
                                onChange={ (e) => setLastName(e.target.value) }
                                className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-2"
                            />
                        </div>
                        <button
                            onClick={ handleUpdateProfile }
                            disabled={ loading }
                            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            { loading ? "Updating..." : "Update Profile" }
                        </button>
                    </div>
                </div>

                {/* Change Password */ }
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Change Password</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                            <input
                                type="password"
                                value={ currentPassword }
                                onChange={ (e) => setCurrentPassword(e.target.value) }
                                className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <input
                                type="password"
                                value={ newPassword }
                                onChange={ (e) => setNewPassword(e.target.value) }
                                className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                            <input
                                type="password"
                                value={ confirmPassword }
                                onChange={ (e) => setConfirmPassword(e.target.value) }
                                className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 p-2"
                            />
                        </div>
                        <button
                            onClick={ handleChangePassword }
                            disabled={ loading }
                            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            { loading ? "Changing..." : "Change Password" }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}