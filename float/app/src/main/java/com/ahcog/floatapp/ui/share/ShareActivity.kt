package com.ahcog.floatapp.ui.share

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import coil.load
import com.ahcog.floatapp.FloatApplication
import com.ahcog.floatapp.R
import com.ahcog.floatapp.data.db.SavedItem
import com.ahcog.floatapp.databinding.ActivityShareBinding
import com.ahcog.floatapp.ui.timeline.TimelineActivity
import com.google.android.material.chip.Chip
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

class ShareActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShareBinding
    private val viewModel: ShareViewModel by viewModels {
        ShareViewModel.Factory((application as FloatApplication).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityShareBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Dismiss on background scrim tap
        binding.scrim.setOnClickListener { saveThenFinish() }

        val channelId = intent.getLongExtra("channel_id", -1L)
        viewModel.preselectChannel(channelId)

        lifecycleScope.launch {
            val item = extractSharedItem(intent)
            viewModel.setPendingItem(item)
            viewModel.saveNow()
            showPreview(item)
        }

        observeChannels()

        binding.btnSave.setOnClickListener { saveThenFinish() }
        binding.btnOpen.setOnClickListener {
            startActivity(Intent(this, TimelineActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            })
            saveThenFinish()
        }
    }

    private fun saveThenFinish() {
        val notes = binding.etNotes.text?.toString().orEmpty()
        viewModel.finalize(notes) {
            runOnUiThread {
                Toast.makeText(this, getString(R.string.saved_to_float), Toast.LENGTH_SHORT).show()
                finish()
            }
        }
    }

    private suspend fun extractSharedItem(intent: Intent): SavedItem {
        val type = intent.type.orEmpty()
        val sourcePackage = callingPackage
            ?: intent.getStringExtra(Intent.EXTRA_PACKAGE_NAME).orEmpty()
        val sourceApp = resolveAppLabel(sourcePackage)

        val text = intent.getStringExtra(Intent.EXTRA_TEXT).orEmpty()
        val subject = intent.getStringExtra(Intent.EXTRA_SUBJECT).orEmpty()
        val title = intent.getStringExtra(Intent.EXTRA_TITLE)?.takeIf { it.isNotBlank() }
            ?: subject
        val url = extractUrl(text)

        val streamUri: Uri? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(Intent.EXTRA_STREAM)
        }

        val localImagePath = if (type.startsWith("image/") && streamUri != null) {
            copyImageToInternal(streamUri)
        } else ""

        return SavedItem(
            title = title,
            text = text,
            url = if (url.isNotBlank()) url else (streamUri?.toString().orEmpty()),
            mimeType = type,
            sourcePackage = sourcePackage,
            sourceApp = sourceApp,
            localImagePath = localImagePath
        )
    }

    private fun extractUrl(text: String): String =
        Regex("""https?://\S+""").find(text)?.value.orEmpty()

    private fun resolveAppLabel(pkg: String): String {
        if (pkg.isBlank()) return ""
        return try {
            packageManager.getApplicationLabel(
                packageManager.getApplicationInfo(pkg, 0)
            ).toString()
        } catch (_: Exception) { pkg }
    }

    private suspend fun copyImageToInternal(uri: Uri): String =
        withContext(Dispatchers.IO) {
            try {
                val dir = filesDir.resolve("float_images").also { it.mkdirs() }
                val dest = File(dir, "${System.currentTimeMillis()}.jpg")
                contentResolver.openInputStream(uri)?.use { input ->
                    dest.outputStream().use { input.copyTo(it) }
                }
                dest.absolutePath
            } catch (_: Exception) { "" }
        }

    private fun showPreview(item: SavedItem) {
        binding.tvPreview.text = when {
            item.title.isNotBlank() -> item.title
            item.url.isNotBlank() -> item.url
            item.text.isNotBlank() -> item.text.take(200)
            else -> getString(R.string.shared_item)
        }
        if (item.sourceApp.isNotBlank()) {
            binding.tvSource.text = getString(R.string.from_app, item.sourceApp)
            binding.tvSource.visibility = View.VISIBLE
        }
        if (item.localImagePath.isNotBlank()) {
            binding.ivPreview.visibility = View.VISIBLE
            binding.ivPreview.load(File(item.localImagePath)) {
                crossfade(true)
            }
        }
    }

    private fun observeChannels() {
        lifecycleScope.launch {
            viewModel.channels.collect { channels ->
                binding.chipGroupChannels.removeAllViews()
                if (channels.isEmpty()) {
                    binding.tvChannelsLabel.visibility = View.GONE
                    return@collect
                }
                binding.tvChannelsLabel.visibility = View.VISIBLE
                channels.forEach { ch ->
                    val chip = Chip(this@ShareActivity).apply {
                        text = buildString {
                            if (ch.emoji.isNotBlank()) append("${ch.emoji} ")
                            append(ch.name)
                        }
                        isCheckable = true
                        isChecked = viewModel.selectedChannelIds.contains(ch.id)
                        setOnCheckedChangeListener { _, checked ->
                            viewModel.toggleChannel(ch.id, checked)
                        }
                    }
                    binding.chipGroupChannels.addView(chip)
                }
            }
        }
    }

    override fun onBackPressed() {
        saveThenFinish()
    }
}
