package com.ahcog.floatapp.ui.channels

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.ahcog.floatapp.FloatApplication
import com.ahcog.floatapp.R
import com.ahcog.floatapp.data.db.Channel
import com.ahcog.floatapp.databinding.ActivityChannelsBinding
import com.ahcog.floatapp.databinding.ItemChannelBinding
import com.ahcog.floatapp.util.DirectShareUtil
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class ChannelsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityChannelsBinding
    private val viewModel: ChannelsViewModel by viewModels {
        ChannelsViewModel.Factory((application as FloatApplication).repository)
    }

    private val adapter = object : ListAdapter<Channel, RecyclerView.ViewHolder>(
        object : DiffUtil.ItemCallback<Channel>() {
            override fun areItemsTheSame(a: Channel, b: Channel) = a.id == b.id
            override fun areContentsTheSame(a: Channel, b: Channel) = a == b
        }
    ) {
        override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int) =
            object : RecyclerView.ViewHolder(
                ItemChannelBinding.inflate(
                    LayoutInflater.from(parent.context), parent, false
                ).root
            ) {}

        override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
            val b = ItemChannelBinding.bind(holder.itemView)
            val ch = getItem(position)
            b.tvName.text = buildString {
                if (ch.emoji.isNotBlank()) append("${ch.emoji} ")
                append(ch.name)
            }
            b.btnEdit.setOnClickListener { showEditDialog(ch) }
            b.btnDelete.setOnClickListener {
                MaterialAlertDialogBuilder(this@ChannelsActivity)
                    .setTitle(R.string.delete_channel)
                    .setMessage(getString(R.string.delete_channel_confirm, ch.name))
                    .setPositiveButton(R.string.delete) { _, _ ->
                        viewModel.deleteChannel(ch)
                        DirectShareUtil.publishChannelShortcuts(
                            this@ChannelsActivity,
                            currentList.filter { it.id != ch.id }
                        )
                    }
                    .setNegativeButton(R.string.cancel, null)
                    .show()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChannelsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        binding.recycler.layoutManager = LinearLayoutManager(this)
        binding.recycler.adapter = adapter

        binding.fab.setOnClickListener { showAddDialog() }

        lifecycleScope.launch {
            viewModel.channels.collect { channels ->
                adapter.submitList(channels)
                binding.tvEmpty.visibility =
                    if (channels.isEmpty()) View.VISIBLE else View.GONE
                DirectShareUtil.publishChannelShortcuts(this@ChannelsActivity, channels)
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }

    private fun showAddDialog() {
        val view = buildChannelDialogView()
        val etName = view.findViewById<EditText>(R.id.et_channel_name)
        val etEmoji = view.findViewById<EditText>(R.id.et_channel_emoji)
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.add_channel)
            .setView(view)
            .setPositiveButton(R.string.add) { _, _ ->
                viewModel.createChannel(etName.text.toString(), etEmoji.text.toString(), "#6200EE")
            }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    private fun showEditDialog(channel: Channel) {
        val view = buildChannelDialogView(channel.name, channel.emoji)
        val etName = view.findViewById<EditText>(R.id.et_channel_name)
        val etEmoji = view.findViewById<EditText>(R.id.et_channel_emoji)
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.edit_channel)
            .setView(view)
            .setPositiveButton(R.string.save) { _, _ ->
                viewModel.renameChannel(channel, etName.text.toString(), etEmoji.text.toString())
            }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    private fun buildChannelDialogView(name: String = "", emoji: String = ""): View {
        val ctx = this
        val layout = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            val pad = resources.getDimensionPixelSize(R.dimen.dialog_padding)
            setPadding(pad, pad, pad, pad)
        }
        val etEmoji = EditText(ctx).apply {
            id = R.id.et_channel_emoji
            hint = getString(R.string.emoji_hint)
            setText(emoji)
            inputType = android.text.InputType.TYPE_CLASS_TEXT
        }
        val etName = EditText(ctx).apply {
            id = R.id.et_channel_name
            hint = getString(R.string.channel_name_hint)
            setText(name)
            inputType = android.text.InputType.TYPE_CLASS_TEXT or
                    android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS
        }
        layout.addView(etEmoji)
        layout.addView(etName)
        return layout
    }
}
