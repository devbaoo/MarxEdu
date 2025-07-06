const Footer = () => {
  return (
    <>
      <section className="w-full flex justify-center bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-6xl flex flex-col md:flex-row items-center gap-12 md:gap-16 lg:gap-24">
          {/* Left Text Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-baloo text-3xl sm:text-4xl md:text-5xl font-bold text-red-600 leading-tight">
              chuyên sâu. thực tiễn. <br className="hidden sm:block" /> khoa học
            </h2>
            <p className="font-baloo mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-700 max-w-xl leading-relaxed">
              Học cùng MarxEdu rất hiệu quả,{" "}
              <span className="text-red-600 font-bold font-baloo">
                phương pháp giảng dạy dựa trên nguyên lý khoa học
              </span>
              ! Các bài học chuyên sâu sẽ giúp bạn hiểu rõ kinh tế chính trị Mác-Lênin, nắm vững lý thuyết và ứng dụng thực tiễn.
            </p>
          </div>

          {/* Right Image */}
          <div className="flex-1 flex justify-center mt-6 md:mt-0">
            <img
              src="https://media.giphy.com/media/gtgdV9KXZpgUjswDS6/giphy.gif"
              alt="MarxEdu Characters"
              className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-sm"
            />
          </div>
        </div>
      </section>

      <section className="w-full flex justify-center bg-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl w-full flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16 lg:gap-20">
          {/* Left Image */}
          <div className="flex-1 flex justify-center mt-6 md:mt-0">
            <img
              src="https://media.giphy.com/media/cDvnVlETDQUl8xh5jK/giphy.gif"
              alt="Scientific Illustration"
              className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-md"
            />
          </div>

          {/* Right Text */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-baloo text-3xl sm:text-4xl md:text-5xl font-bold text-red-600 leading-tight">
              Dựa trên căn cứ <br className="hidden sm:block" /> khoa học
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-700 max-w-xl leading-relaxed font-baloo">
              Chúng tôi kết hợp các phương pháp giảng dạy khoa học với nội dung chuyên sâu để tạo nên những khóa học hữu ích giúp bạn nắm vững lý thuyết kinh tế chính trị Mác-Lênin!
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 flex justify-center">
        <div className="max-w-[988px] w-full flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 lg:gap-[101px]">
          {/* Text content on the left */}
          <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center items-center md:items-start">
            <h2 className="font-baloo text-3xl sm:text-4xl md:text-[2.5rem] leading-tight md:leading-[2.75rem] text-red-600   font-bold">
              tiếp thêm động lực
            </h2>
            <p className="text-sm sm:text-base md:text-[1.15rem] leading-normal md:leading-[1.75rem] font-medium text-gray-700 mt-3 sm:mt-4 max-w-xl font-baloo mx-auto md:mx-0">
              Ứng dụng giúp người học dễ dàng xây dựng thói quen học tập về kinh tế chính trị, qua những tính năng tương tác thú vị, các thử thách học thuật, và hệ thống theo dõi tiến độ khoa học.
            </p>
          </div>

          {/* Image on the right */}
          <div className="flex-1 flex justify-center w-full">
            <img
              src="https://media.giphy.com/media/kQulaQZ8vc6UUkBS6O/giphy.gif"
              alt="Quiz Motivation"
              className="w-full max-w-[320px] md:max-w-[360px]"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 lg:gap-[101px] px-4 py-12 sm:py-16 md:py-20 max-w-[988px] mx-auto bg-white">
        {/* Image section */}
        <div className="flex-1 flex justify-center order-2 md:order-1 mt-6 md:mt-0">
          <img
            src="https://media.giphy.com/media/TkQAT5kmemGUp5Ok4U/giphy.gif"
            alt="Personalized learning"
            className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-md"
          />
        </div>

        {/* Text section */}
        <div className="flex-1 text-center md:text-left order-1 md:order-2">
          <h2 className="text-3xl sm:text-4xl md:text-[2.5rem] leading-tight md:leading-[2.75rem] font-bold text-red-600 font-baloo">
            phương pháp học <br className="hidden sm:block" /> khoa học
          </h2>
          <p className="text-gray-700 text-sm sm:text-base md:text-[1.25rem] leading-normal md:leading-[1.75rem] font-medium mt-3 sm:mt-4 font-baloo max-w-xl mx-auto md:mx-0">
            Kết hợp phương pháp giảng dạy truyền thống và công nghệ hiện đại, các bài học được thiết kế khoa học để giúp bạn nắm vững kiến thức kinh tế chính trị Mác-Lênin một cách sâu sắc và toàn diện.
          </p>
        </div>
      </section>
    </>
  );
};

export default Footer;
