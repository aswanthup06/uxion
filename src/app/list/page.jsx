// list.jsx
"use client"

import React, { useState, useEffect } from 'react';
import { jobCategories } from './jobCategories';
import { ChevronDown, ChevronRight, SearchIcon, SadIcon } from './icons';

// ✅ JobCard component
const JobCard = ({ job }) => {
  return (
    <div className="bg-surface-card p-3 rounded-card border border-border-default hover:border-brand-accent/40 transition-all duration-200">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-brand rounded-full mr-3"></div>
        <span className="text-sm text-text-primary">{job}</span>
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
        <h3 className="text-lg font-semibold text-text-primary mr-2 group-hover:text-brand transition-colors">
          {subcategory.name}
        </h3>
        <span className="text-text-muted group-hover:text-brand transition-colors">
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
    <div className="bg-surface-card rounded-panel overflow-hidden mb-3 border border-border-default shadow-subtle">
      <div
        className="flex items-center justify-between p-4 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center mr-3 group-hover:bg-brand-soft-hover transition-colors">
            <span className="text-base">{category.icon}</span>
          </div>
          <h2 className="text-sm md:text-base lg:text-lg font-medium text-text-primary group-hover:text-brand transition-colors">
            {category.name}
          </h2>
        </div>
        <span className="text-text-muted group-hover:text-brand transition-colors">
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </span>
      </div>

      {expanded && (
        <div className="p-4 border-t border-border-subtle bg-surface-subtle/50">
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
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
        <SearchIcon />
      </div>
      <input
        type="text"
        className="block rounded-control w-full pl-10 pr-3 py-3.5 border border-border-default bg-surface-card text-text-primary placeholder:text-text-muted shadow-subtle focus:outline-none focus:ring-2 focus:ring-brand-soft focus:border-brand transition"
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
    <div className="min-h-screen bg-surface-page py-8 px-4 sm:px-6 lg:px-8">
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
            <div className="inline-flex text-brand items-center justify-center w-16 h-16 rounded-full bg-brand-soft mb-4">
              <SadIcon />
            </div>
            <h3 className="text-xl font-medium text-text-primary mb-2">No jobs found</h3>
            <p className="text-text-muted">
              No jobs match your search criteria. Try different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
