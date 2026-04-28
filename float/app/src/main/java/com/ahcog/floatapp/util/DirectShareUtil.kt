package com.ahcog.floatapp.util

import android.content.Context
import android.content.Intent
import androidx.core.app.Person
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat
import androidx.core.graphics.drawable.IconCompat
import com.ahcog.floatapp.R
import com.ahcog.floatapp.data.db.Channel
import com.ahcog.floatapp.ui.share.ShareActivity

object DirectShareUtil {

    private const val CATEGORY = "com.ahcog.floatapp.category.CHANNEL"

    /**
     * Publishes one dynamic shortcut per channel so each channel appears as a
     * direct-share target in the Android share sheet under the Float row.
     * Android shows up to 4 direct-share targets per app.
     */
    fun publishChannelShortcuts(context: Context, channels: List<Channel>) {
        ShortcutManagerCompat.removeAllDynamicShortcuts(context)
        val shortcuts = channels.take(4).map { ch ->
            ShortcutInfoCompat.Builder(context, "channel_${ch.id}")
                .setShortLabel(ch.name)
                .setLongLabel("Float → ${ch.name}")
                .setIcon(
                    if (ch.emoji.isNotBlank())
                        IconCompat.createWithResource(context, R.drawable.ic_channel)
                    else
                        IconCompat.createWithResource(context, R.drawable.ic_channel)
                )
                .setIntent(
                    Intent(context, ShareActivity::class.java).apply {
                        action = Intent.ACTION_DEFAULT
                        putExtra("channel_id", ch.id)
                    }
                )
                .setCategories(setOf(CATEGORY))
                .setLongLived(true)
                .build()
        }
        ShortcutManagerCompat.setDynamicShortcuts(context, shortcuts)
    }
}
