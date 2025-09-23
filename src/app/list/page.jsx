// list.jsx
"use client"

import React, { useState, useEffect } from 'react';
import { jobCategories } from './jobCategories';
import { ChevronDown, ChevronRight, SearchIcon, SadIcon } from './icons';

// ✅ JobCard component
const JobCard = ({ job }) => {
  return (
    <div className="bg-[#0B1F38] p-3 rounded-lg border border-[#122B45] hover:border-orange-500/30 transition-all duration-200">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
        <span className="text-sm text-white/90">{job}</span>
      </div>
    </div>
  );
};

// ✅ Subcategory
const Subcategory = ({ subcategory, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // 🔑 Update when search changes
  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div className="mb-6 last:mb-0">
      <div
        className="flex items-center cursor-pointer mb-3 group"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-white/90 mr-2 group-hover:text-white transition-colors">
          {subcategory.name}
        </h3>
        <span className="text-white/50 group-hover:text-white transition-colors">
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </span>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {subcategory.jobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ Category
const Category = ({ category, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // 🔑 Update when search changes
  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div className="bg-[#0B1F38] rounded-xl overflow-hidden mb-2 border border-[#122B45]">
      <div
        className="flex items-center justify-between p-4 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#122B45] flex items-center justify-center mr-3 group-hover:bg-[#1A365D] transition-colors">
            <span className="text-base">{category.icon}</span>
          </div>
          <h2 className="text-sm md:text-base lg:text-lg font-base text-white/70 group-hover:text-white transition-colors">
            {category.name}
          </h2>
        </div>
        <span className="text-white/50 group-hover:text-white transition-colors">
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </span>
      </div>

      {expanded && (
        <div className="p-4 border-t border-[#122B45]">
          {category.subcategories.map((subcategory, index) => (
            <Subcategory
              key={index}
              subcategory={subcategory}
              defaultExpanded={subcategory.defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ Search bar
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative mb-8">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="text"
        className="block rounded-full w-full pl-10 pr-3 py-4 border border-[#122B45] bg-[#0B1F38] text-white/90 placeholder-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        placeholder="Search for IT jobs..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
};

// ✅ Main List
export default function List() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(jobCategories);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredCategories(jobCategories);
      return;
    }

    const filtered = jobCategories
      .map((category) => {
        const subcategories = category.subcategories
          .map((subcategory) => {
            const jobs = subcategory.jobs.filter((job) =>
              job.toLowerCase().includes(query.toLowerCase())
            );

            return {
              ...subcategory,
              jobs,
              defaultExpanded: jobs.length > 0, // auto-expand on match
            };
          })
          .filter((subcategory) => subcategory.jobs.length > 0);

        return {
          ...category,
          subcategories,
          defaultExpanded: subcategories.length > 0, // auto-expand on match
        };
      })
      .filter((category) => category.subcategories.length > 0);

    setFilteredCategories(filtered);
  };

  return (
    <div className="min-h-screen bg-[#031225] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <SearchBar onSearch={handleSearch} />

        {filteredCategories.length > 0 ? (
          <div>
            {filteredCategories.map((category) => (
              <Category
                key={category.id}
                category={category}
                defaultExpanded={category.defaultExpanded}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex text-white items-center justify-center w-16 h-16 rounded-full bg-[#0B1F38] mb-4">
              <SadIcon />
            </div>
            <h3 className="text-xl font-medium text-white/90 mb-2">No jobs found</h3>
            <p className="text-white/70">
              No jobs match your search criteria. Try different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
