package com.ahcog.floatapp.ui.timeline

import android.text.format.DateUtils
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.ahcog.floatapp.data.db.SavedItem
import com.ahcog.floatapp.databinding.ItemSavedBinding
import java.io.File

class SavedItemAdapter(
    private val onDelete: (SavedItem) -> Unit
) : ListAdapter<SavedItem, SavedItemAdapter.ViewHolder>(DIFF) {

    inner class ViewHolder(private val b: ItemSavedBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(item: SavedItem) {
            b.tvTitle.text = when {
                item.title.isNotBlank() -> item.title
                item.url.isNotBlank() -> item.url
                else -> item.text.take(120)
            }
            b.tvMeta.text = buildString {
                if (item.sourceApp.isNotBlank()) append(item.sourceApp)
                append(" · ")
                append(
                    DateUtils.getRelativeTimeSpanString(
                        item.timestamp,
                        System.currentTimeMillis(),
                        DateUtils.MINUTE_IN_MILLIS
                    )
                )
            }
            b.tvSnippet.text = when {
                item.title.isNotBlank() && item.text.isNotBlank() -> item.text.take(160)
                item.url.isNotBlank() && item.title.isNotBlank() -> item.url
                else -> ""
            }
            if (item.localImagePath.isNotBlank()) {
                b.ivThumb.visibility = android.view.View.VISIBLE
                b.ivThumb.load(File(item.localImagePath)) { crossfade(true) }
            } else {
                b.ivThumb.visibility = android.view.View.GONE
            }
            b.btnDelete.setOnClickListener { onDelete(item) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ViewHolder(
            ItemSavedBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        )

    override fun onBindViewHolder(holder: ViewHolder, position: Int) =
        holder.bind(getItem(position))

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<SavedItem>() {
            override fun areItemsTheSame(a: SavedItem, b: SavedItem) = a.id == b.id
            override fun areContentsTheSame(a: SavedItem, b: SavedItem) = a == b
        }
    }
}
