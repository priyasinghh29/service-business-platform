{{-- Expects: $bulkRoute (route name), optional $bulkActions --}}
@php($bulkActions = $bulkActions ?? ['enable' => 'Enable', 'disable' => 'Disable', 'delete' => 'Delete'])
<div class="d-flex flex-wrap gap-2 align-items-center mb-3" id="bulk-toolbar" style="display:none !important;">
    <form method="POST" action="{{ route($bulkRoute) }}" id="bulk-form" class="d-flex flex-wrap gap-2 align-items-center">
        @csrf
        <input type="hidden" name="action" id="bulk-action" value="">
        <div id="bulk-ids"></div>
        <span class="text-muted small me-2"><span id="bulk-count">0</span> selected</span>
        @foreach($bulkActions as $action => $label)
            <button type="button" class="btn btn-sm {{ $action === 'delete' ? 'btn-outline-danger' : 'btn-outline-secondary' }}"
                onclick="submitBulk('{{ $action }}'{{ $action === 'delete' ? ', true' : '' }})">{{ $label }}</button>
        @endforeach
    </form>
</div>
<script>
(function () {
    function selectedBoxes() {
        return Array.from(document.querySelectorAll('.bulk-check:checked'));
    }
    function syncBulkUi() {
        var boxes = selectedBoxes();
        var toolbar = document.getElementById('bulk-toolbar');
        var count = document.getElementById('bulk-count');
        var master = document.getElementById('bulk-master');
        if (count) count.textContent = String(boxes.length);
        if (toolbar) toolbar.style.setProperty('display', boxes.length ? 'flex' : 'none', 'important');
        if (master) {
            var all = document.querySelectorAll('.bulk-check');
            master.checked = all.length > 0 && boxes.length === all.length;
            master.indeterminate = boxes.length > 0 && boxes.length < all.length;
        }
    }
    window.toggleBulkAll = function (master) {
        document.querySelectorAll('.bulk-check').forEach(function (el) { el.checked = master.checked; });
        syncBulkUi();
    };
    window.submitBulk = function (action, confirmDelete) {
        var boxes = selectedBoxes();
        if (!boxes.length) return;
        if (confirmDelete && !confirm('Delete ' + boxes.length + ' selected record(s)?')) return;
        var form = document.getElementById('bulk-form');
        var ids = document.getElementById('bulk-ids');
        ids.innerHTML = '';
        boxes.forEach(function (box) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'ids[]';
            input.value = box.value;
            ids.appendChild(input);
        });
        document.getElementById('bulk-action').value = action;
        form.submit();
    };
    document.addEventListener('change', function (e) {
        if (e.target && (e.target.classList.contains('bulk-check') || e.target.id === 'bulk-master')) {
            syncBulkUi();
        }
    });
})();
</script>
