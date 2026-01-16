import {useContext, useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";
import Dashboard from "../components/Dashboard.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {assets} from "../assets/assets.js";
import uploadProfileImage from "../util/uploadProfileImage.js";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import {AppContext} from "../context/AppContext.jsx";
import {ImageOff, Upload} from "lucide-react";

const Profile = () => {
    useUser();
    const {user, setUser} = useContext(AppContext);
    const [fullName, setFullName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setFullName(user?.fullName || "");
        setProfileImageUrl(user?.profileImageUrl || "");
    }, [user]);

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        uploadImage(file);
    };

    const uploadImage = async (file) => {
        setUploading(true);
        try {
            const url = await uploadProfileImage(file);
            setProfileImageUrl(url);
            toast.success("Profile photo uploaded");
        } catch (error) {
            toast.error(error.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            toast.error("Name is required");
            return;
        }

        setSaving(true);
        try {
            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_PROFILE, {
                fullName: fullName.trim(),
                profileImageUrl,
            });
            setUser(response.data);
            toast.success("Profile updated");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleRemovePhoto = () => {
        setProfileImageUrl("");
    };

    const displayImage = profileImageUrl || assets.defaultProfile;

    return (
        <Dashboard activeMenu="Profile">
            <div className="my-5 mx-auto max-w-4xl">
                <div className="card">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                            <p className="text-sm text-gray-500 mt-1">Update your name and profile photo.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border">
                                <img src={displayImage} alt="profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    className="add-btn inline-flex items-center gap-2"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    <Upload size={16} /> {uploading ? "Uploading..." : "Upload photo"}
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                    onClick={handleRemovePhoto}
                                >
                                    <ImageOff size={16} /> Remove photo
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Full name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-700"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="text"
                                value={user?.email || ""}
                                disabled
                                className="w-full border border-gray-100 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                setFullName(user?.fullName || "");
                                setProfileImageUrl(user?.profileImageUrl || "");
                            }}
                            disabled={saving || uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="add-btn"
                            onClick={handleSave}
                            disabled={saving || uploading}
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </div>
            </div>
        </Dashboard>
    );
};

export default Profile;
