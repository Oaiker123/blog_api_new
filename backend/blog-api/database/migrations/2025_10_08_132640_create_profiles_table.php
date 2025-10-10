<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // 🌐 Thông tin cơ bản
            $table->string('username')->unique()->nullable(); // public handle (@username)
            $table->string('display_name')->nullable();       // tên hiển thị
            $table->text('bio')->nullable();                  // mô tả bản thân
            $table->string('avatar_path')->nullable();        // ảnh đại diện
            $table->string('cover_path')->nullable();         // ảnh bìa

            // 🏠 Thông tin phụ
            $table->string('location')->nullable();           // địa điểm
            $table->date('birthdate')->nullable();            // ngày sinh
            $table->enum('gender', ['male', 'female', 'other'])->nullable(); // giới tính
            $table->string('phone')->nullable();              // số điện thoại
            $table->string('website')->nullable();            // website cá nhân

            // 🌍 Mạng xã hội (JSON)
            $table->json('social_links')->nullable();         // { "facebook": "...", "github": "...", "linkedin": "..." }

            // 👁️ Quyền riêng tư & trạng thái
            $table->enum('visibility', ['public','private'])->default('public');
            $table->boolean('is_verified')->default(false);   // đã xác minh tài khoản chưa

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
