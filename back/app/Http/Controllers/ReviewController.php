<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Movie;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 15);
        $perPage = min(max($perPage, 1), 10000); // Limit between 1 and 10000 (for "show all")
        
        $query = Review::with('movie');
        
        // Apply filters
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->whereHas('movie', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('director', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('min_rating')) {
            $minRating = $request->query('min_rating');
            if ($minRating > 0) {
                $query->where('rating', '>=', $minRating);
            }
        }
        
        if ($request->has('year')) {
            $year = $request->query('year');
            $query->whereHas('movie', function($q) use ($year) {
                $q->where('release_year', $year);
            });
        }
        
        // Apply sorting
        $sortBy = $request->query('sort_by', 'newest');
        if ($sortBy === 'rating') {
            $query->orderByDesc('rating')->orderByDesc('id');
        } else {
            $query->orderByDesc('created_at');
        }
        
        $reviews = $query->paginate($perPage);
        
        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'rating' => 'required|numeric|min:0|max:5',
            'comment' => 'nullable|string'
        ]);

        $review = Review::create($request->all());
        $review->load('movie');
        
        return response()->json($review, 201);
    }

    public function show($id)
    {
        $review = Review::with('movie')->findOrFail($id);
        return response()->json($review);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'rating' => 'sometimes|numeric|min:0|max:5',
            'comment' => 'sometimes|nullable|string'
        ]);

        $review = Review::findOrFail($id);
        $review->update($request->all());
        $review->load('movie');
        
        return response()->json($review);
    }
}