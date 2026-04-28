package com.ahcog.floatapp.ui.timeline

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SearchView
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.ahcog.floatapp.FloatApplication
import com.ahcog.floatapp.R
import com.ahcog.floatapp.databinding.ActivityTimelineBinding
import com.ahcog.floatapp.ui.channels.ChannelsActivity
import com.google.android.material.chip.Chip
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class TimelineActivity : AppCompatActivity() {

    private lateinit var binding: ActivityTimelineBinding
    private val viewModel: TimelineViewModel by viewModels {
        TimelineViewModel.Factory((application as FloatApplication).repository)
    }
    private val adapter = SavedItemAdapter { item ->
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.delete_item)
            .setMessage(R.string.delete_item_confirm)
            .setPositiveButton(R.string.delete) { _, _ -> viewModel.deleteItem(item) }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTimelineBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)

        binding.recycler.layoutManager = LinearLayoutManager(this)
        binding.recycler.adapter = adapter

        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(q: String?) = true.also { viewModel.setQuery(q.orEmpty()) }
            override fun onQueryTextChange(q: String?) = true.also { viewModel.setQuery(q.orEmpty()) }
        })

        binding.fabChannels.setOnClickListener {
            startActivity(Intent(this, ChannelsActivity::class.java))
        }

        observeItems()
        observeChannels()
    }

    private fun observeItems() {
        lifecycleScope.launch {
            viewModel.items.collect { items ->
                adapter.submitList(items)
                binding.tvEmpty.visibility =
                    if (items.isEmpty()) android.view.View.VISIBLE else android.view.View.GONE
            }
        }
    }

    private fun observeChannels() {
        lifecycleScope.launch {
            viewModel.channels.collect { channels ->
                binding.chipGroupFilter.removeAllViews()
                // "All" chip
                val allChip = Chip(this@TimelineActivity).apply {
                    text = getString(R.string.all)
                    isCheckable = true
                    isChecked = true
                    setOnCheckedChangeListener { _, checked ->
                        if (checked) viewModel.setChannelFilter(null)
                    }
                }
                binding.chipGroupFilter.addView(allChip)
                channels.forEach { ch ->
                    val chip = Chip(this@TimelineActivity).apply {
                        text = buildString {
                            if (ch.emoji.isNotBlank()) append("${ch.emoji} ")
                            append(ch.name)
                        }
                        isCheckable = true
                        setOnCheckedChangeListener { _, checked ->
                            if (checked) {
                                allChip.isChecked = false
                                viewModel.setChannelFilter(ch.id)
                            }
                        }
                    }
                    binding.chipGroupFilter.addView(chip)
                }
            }
        }
    }
}
