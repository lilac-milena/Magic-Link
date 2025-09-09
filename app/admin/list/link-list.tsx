'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLinkAction, editLinkAction } from './actions';
import {
    SearchIcon,
    ClearIcon,
    EditIcon,
    DeleteIcon,
    LoadingSpinner,
    CheckIcon,
    LinkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    InfoIcon,
    CloseIcon
} from '../components/Icons';

// HTML编码函数，防止XSS攻击
function htmlEncode(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

type Link = {
    _id: string;
    path: string;
    to: string;
    creater: string;
};

interface LinkListProps {
    initialLinks: Link[];
    initialPage: number;
    pageCount: number;
    searchQuery?: string;
}

export default function LinkList({ initialLinks, initialPage, pageCount, searchQuery }: LinkListProps) {
    const router = useRouter();
    const [searchField, setSearchField] = useState('path');
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    // Edit modal states
    const [editingLink, setEditingLink] = useState<Link | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newToValue, setNewToValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState('');

    // Parse search query to populate form - using useEffect instead of useState
    useEffect(() => {
        if (searchQuery) {
            try {
                const parsedQuery = JSON.parse(searchQuery);
                if (parsedQuery.path) {
                    setSearchField('path');
                    // Extract the search term from the regex object
                    if (typeof parsedQuery.path === 'object' && parsedQuery.path.$regex) {
                        setSearchTerm(parsedQuery.path.$regex);
                    } else {
                        setSearchTerm(parsedQuery.path);
                    }
                } else if (parsedQuery.to) {
                    setSearchField('to');
                    // Extract the search term from the regex object
                    if (typeof parsedQuery.to === 'object' && parsedQuery.to.$regex) {
                        setSearchTerm(parsedQuery.to.$regex);
                    } else {
                        setSearchTerm(parsedQuery.to);
                    }
                } else if (parsedQuery.creater) {
                    setSearchField('creater');
                    // Extract the search term from the regex object
                    if (typeof parsedQuery.creater === 'object' && parsedQuery.creater.$regex) {
                        setSearchTerm(parsedQuery.creater.$regex);
                    } else {
                        setSearchTerm(parsedQuery.creater);
                    }
                }
            } catch (e) {
                // Invalid JSON, ignore
            }
        }
    }, [searchQuery]);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            // If search term is empty, clear the search
            router.push('/admin/list?page=1');
            return;
        }

        // Build query based on selected field
        const query: Record<string, any> = {};
        query[searchField] = { $regex: searchTerm, $options: 'i' }; // Case-insensitive regex search
        
        // When starting a new search, always go back to page 1
        router.push(`/admin/list?page=1&search=${encodeURIComponent(JSON.stringify(query))}`);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        router.push('/admin/list?page=1');
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pageCount) return;
        
        // Preserve search when changing pages
        let search = '';
        if (searchTerm.trim()) {
            const query: Record<string, any> = {};
            query[searchField] = { $regex: searchTerm, $options: 'i' };
            search = `&search=${encodeURIComponent(JSON.stringify(query))}`;
        }
        
        router.push(`/admin/list?page=${newPage}${search}`);
    };

    const handleEdit = (link: Link) => {
        setEditingLink(link);
        setNewToValue(link.to);
        setIsEditModalOpen(true);
        setEditError('');
    };

    const handleSaveEdit = async () => {
        if (!editingLink || !newToValue.trim()) {
            setEditError('Destination URL is required');
            return;
        }

        // Basic URL validation
        try {
            new URL(newToValue);
        } catch (e) {
            setEditError('Please enter a valid URL');
            return;
        }

        setIsEditing(true);
        setEditError('');

        try {
            const result = await editLinkAction(editingLink.path, newToValue);
            if (result && 'error' in result && result.error) {
                setEditError(result.error);
            } else {
                setIsEditModalOpen(false);
                setEditingLink(null);
                setNewToValue('');
            }
        } catch (error) {
            setEditError('An unexpected error occurred');
        } finally {
            setIsEditing(false);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingLink(null);
        setNewToValue('');
        setEditError('');
    };

    const handleDelete = async (path: string) => {
        if (confirm(`Are you sure you want to delete the link ${path}?`)) {
            setDeletingId(path);
            const result = await deleteLinkAction(path);
            if (result && 'error' in result && result.error) {
                alert(`Failed to delete link: ${result.error}`);
            }
            setDeletingId(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-shrink-0">
                        <select
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                            className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-md input-focus"
                        >
                            <option value="path">Path</option>
                            <option value="to">Destination URL</option>
                            <option value="creater">Creator</option>
                        </select>
                    </div>
                    
                    <div className="flex-grow relative">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                placeholder={`Search by ${searchField}...`}
                                className={`w-full px-4 py-2 pl-10 border rounded-md input-focus ${
                                    isSearchFocused
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : 'border-gray-300'
                                }`}
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <SearchIcon />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md button-hover shadow-md flex items-center gap-2"
                        >
                            <SearchIcon />
                            Search
                        </button>
                        
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md button-hover flex items-center gap-2"
                            >
                                <ClearIcon />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Search Info */}
                {searchTerm && (
                    <div className="mt-4 text-sm text-gray-600 flex items-center gap-2 animate-fade-in">
                        <InfoIcon />
                        Searching for "{searchTerm}" in {searchField}
                    </div>
                )}
            </div>

            {/* Links Table */}
            <div className="overflow-x-auto shadow-md rounded-lg card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Path</th>
                            <th scope="col" className="px-6 py-3">To</th>
                            <th scope="col" className="px-6 py-3">Creator</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialLinks.map((link, index) => (
                            <tr
                                key={link._id}
                                className="bg-white border-b table-row-hover animate-fade-in-up"
                                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                            >
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 interactive-transition">
                                        {link.path}
                                    </span>
                                </td>
                                <td className="px-6 py-4 break-all">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon />
                                        <span className="text-gray-600">{htmlEncode(link.to)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center interactive-transition">
                                            <span className="text-xs font-medium text-indigo-800">
                                                {link.creater.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span>{link.creater}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 flex gap-4">
                                    <button
                                        onClick={() => handleEdit(link)}
                                        className="font-medium text-blue-600 hover:text-blue-800 link-transition flex items-center gap-1"
                                    >
                                        <EditIcon />
                                        Edit
                                    </button>
                                    <form action={async () => {
                                        const result = await deleteLinkAction(link.path);
                                        if (result && 'error' in result && result.error) {
                                            alert(`Failed to delete link: ${result.error}`);
                                        }
                                    }}>
                                        <button
                                            type="submit"
                                            className="font-medium text-red-600 hover:text-red-800 link-transition flex items-center gap-1 disabled:opacity-50"
                                            disabled={deletingId === link.path}
                                        >
                                            {deletingId === link.path ? (
                                                <>
                                                    <LoadingSpinner />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <DeleteIcon />
                                                    Delete
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <button
                    onClick={() => handlePageChange(initialPage - 1)}
                    disabled={initialPage <= 1}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 button-hover flex items-center gap-1"
                >
                    <ChevronLeftIcon />
                    Previous
                </button>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-medium interactive-transition">
                    {initialPage} / {pageCount}
                </span>
                <button
                    onClick={() => handlePageChange(initialPage + 1)}
                    disabled={initialPage >= pageCount}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 button-hover flex items-center gap-1"
                >
                    Next
                    <ChevronRightIcon />
                </button>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingLink && (
                <>
                    <div
                        className="fixed inset-0 z-40 modal-backdrop animate-fade-in"
                        onClick={handleCloseEditModal}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform animate-scale-in border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Edit Link</h3>
                                    <button
                                        onClick={handleCloseEditModal}
                                        className="text-gray-400 hover:text-gray-500 interactive-transition"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Path
                                        </label>
                                        <div className="px-3 py-2 bg-gray-100 rounded-md">
                                            <span className="text-sm font-mono text-blue-600">{editingLink.path}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Destination
                                        </label>
                                        <div className="px-3 py-2 bg-gray-100 rounded-md break-all">
                                            <span className="text-sm font-mono text-gray-600">{htmlEncode(editingLink.to)}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="newTo" className="block text-sm font-medium text-gray-700 mb-1">
                                            New Destination URL
                                        </label>
                                        <input
                                            type="text"
                                            id="newTo"
                                            value={newToValue}
                                            onChange={(e) => setNewToValue(e.target.value)}
                                            placeholder="http(s)://"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus"
                                            disabled={isEditing}
                                        />
                                        {editError && (
                                            <p className="mt-1 text-sm text-red-600 animate-fade-in">{editError}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        disabled={isEditing}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        disabled={isEditing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isEditing ? (
                                            <>
                                                <LoadingSpinner color="text-white" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon />
                                                Save
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
