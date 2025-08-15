import UpdatePasswordForm from './update-password-form';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] px-2">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between bg-[#EA384C] text-white w-1/2 p-10 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white text-[#EA384C] font-bold rounded-lg px-3 py-2 text-lg shadow-sm">
                TFS
              </div>
              <span className="font-semibold text-xl">Express Logistics</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-2">
              Welcome to the TFS
              <br />
              Driver Portal
            </h1>
            <p className="text-base text-white/80 mb-6">
              Access training videos, documentation, and resources all in one
              place.
            </p>
            <div className="bg-[#f75a68] bg-opacity-90 rounded-xl p-6 mt-8 shadow-inner">
              <h2 className="text-lg font-semibold mb-2">
                Why use Driver Hub?
              </h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-white/80">
                <li>Access all training materials in one place</li>
                <li>Stay up-to-date with company policies</li>
                <li>Complete required training at your own pace</li>
                <li>Access resources on the go from any device</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Right Panel */}
        <div className="flex flex-1 flex-col justify-center items-center bg-white py-12 px-6">
          <div className="w-full max-w-md">
            <UpdatePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
