export function NewsletterSection() {
  return (
    <section className="bg-[#093059] py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center justify-center gap-6 sm:gap-7 lg:gap-8">
          {/* Heading */}
          <div className="flex w-full max-w-md flex-col items-center gap-2 text-center text-[#f8f3ec] px-4">
            <h2 className="text-xl font-bold sm:text-2xl lg:text-[24px]" dir="auto">
              ابحث في الأبحاث / أرشيف المجلة
            </h2>
            <p className="text-base font-medium sm:text-lg lg:text-[20px]" dir="auto">
              احصل على آخر المقالات المنشورة
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
            <input
              type="text"
              placeholder="ابحث عن اخر الابحاث...."
              className="order-1 flex h-12 w-full items-center justify-end rounded-2xl bg-white p-3 text-right text-sm text-[#666666] placeholder:text-[#666666] sm:order-2 sm:h-[49px] sm:flex-1 sm:text-base"
              dir="rtl"
            />

            <button className="order-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b2813e] transition-colors hover:bg-[#976e35] sm:order-1 sm:h-[49px] sm:w-auto sm:min-w-[100px] sm:px-6">
              <span className="text-nowrap text-right text-sm text-[#f2f2f2] sm:text-base" dir="auto">
                بحث
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
