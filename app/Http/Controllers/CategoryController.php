<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        return Cache::remember('categories_with_children', 600, function () {
            return Category::whereNull('parent_id')->with('children')->get();
        });
    }
}
