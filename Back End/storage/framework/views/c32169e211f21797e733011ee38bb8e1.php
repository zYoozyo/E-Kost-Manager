<?php $__env->startComponent('mail::message'); ?>
    # Undangan Bergabung ke <?php echo new \Illuminate\Support\EncodedHtmlString($kostName); ?>


    Halo <?php echo new \Illuminate\Support\EncodedHtmlString($invitation->name ?? 'Calon Penyewa'); ?>,

    Anda telah diundang oleh **<?php echo new \Illuminate\Support\EncodedHtmlString($ownerName); ?>** untuk bergabung sebagai penyewa di **<?php echo new \Illuminate\Support\EncodedHtmlString($kostName); ?>**.

    Klik tombol di bawah ini untuk menerima undangan dan menyelesaikan pendaftaran:

    <?php $__env->startComponent('mail::button', ['url' => $acceptUrl, 'color' => 'primary']); ?>
        Terima Undangan
    <?php echo $__env->renderComponent(); ?>

    Atau salin dan buka tautan berikut di browser Anda:
    <?php echo new \Illuminate\Support\EncodedHtmlString($acceptUrl); ?>


    **Informasi Penting:**
    - Tautan ini akan kedaluwarsa dalam 7 hari
    - Anda akan diminta untuk membuat password
    - Email: <?php echo new \Illuminate\Support\EncodedHtmlString($invitation->email); ?>


    Jika Anda tidak merasa mendaftar atau tidak mengenal pemilik kos ini, abaikan email ini.

    Terima kasih,<br>
    <?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name')); ?>


    ---

    <small style="color: #999;">
        Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
    </small>
<?php echo $__env->renderComponent(); ?>
<?php /**PATH D:\E-Kost Manager Version3\E-Kost Manager Version2\Back End\resources\views/emails/invitation.blade.php ENDPATH**/ ?>