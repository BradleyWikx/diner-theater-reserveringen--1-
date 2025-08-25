import { useState, useEffect, useMemo } from 'react';

export const usePagination = <T,>(items: T[], itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / itemsPerPage);
    
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return items.slice(start, end);
    }, [items, currentPage, itemsPerPage]);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    
    useEffect(() => {
        if(currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [items.length, totalPages, currentPage]);

    return { currentPage, totalPages, currentItems, nextPage, prevPage, goToPage };
};
