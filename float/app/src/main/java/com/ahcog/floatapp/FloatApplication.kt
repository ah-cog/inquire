package com.ahcog.floatapp

import android.app.Application
import com.ahcog.floatapp.data.FloatRepository
import com.ahcog.floatapp.data.db.AppDatabase

class FloatApplication : Application() {
    val database by lazy { AppDatabase.getInstance(this) }
    val repository by lazy { FloatRepository(database) }
}
