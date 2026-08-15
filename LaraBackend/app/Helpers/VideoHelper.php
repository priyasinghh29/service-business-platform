<?php

namespace App\Helpers;

use FFMpeg\FFProbe;

class VideoHelper
{
    public static function getDuration($path)
    {
        try {
            $ffprobe = FFProbe::create();
            $duration = $ffprobe->format($path)->get('duration');

            return (int) round($duration);
        } catch (\Exception $e) {
            return null; // Video unreadable or path invalid
        }
    }
}
