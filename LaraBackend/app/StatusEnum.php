<?php

namespace App;

enum StatusEnum: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case PROCESSING = 'processing';
}
